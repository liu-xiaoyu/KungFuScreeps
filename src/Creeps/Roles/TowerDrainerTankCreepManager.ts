import { MemoryApi_Creep, RoomHelper_Structure, CreepAllApi } from "Utils/Imports/internals";
import {
    ROLE_TOWER_TANK,
} from "Utils/Imports/constants";

// Manager for the miner creep role
export class TowerDrainerTankCreepManager implements IMiliCreepRoleManager {
    public name: RoleConstant = ROLE_TOWER_TANK;

    // Current Status
    // Medic thinks its on a healing position
    // Tank leaves without his homie
    // Can't get the towers because data is null, need to make sure it gets updated when creep enters the room
    constructor() {
        const self = this;
        self.runCreepRole = self.runCreepRole.bind(this);
    }

    /**
     * run the TowerDrainerTank creep
     * @param creep the creep we are running
     */
    public runCreepRole(creep: Creep): void {
        // Check first if we need to retreat, then (if we're rallied with healer + NOT on an exit tile)
        // Move to the exit tile until these are true, everything is handled within the functions from here
        if (!this.retreatTowerCreep(creep)) {
            if (creep.pos.roomName !== creep.memory.targetRoom && this.medicInAnotherRoom(creep)) {
                if (this.isOnExitTile(creep.pos)) {
                    CreepAllApi.moveCreepOffExit(creep);
                    return;
                }
            }
            else if (this.rallyWithHealer(creep)) {
                creep.moveTo(new RoomPosition(25, 25, creep.memory.targetRoom));
                return;
            }
        }
    }

    /**
     * check if medic is oin another room
     * @param creep the tower tank
     */
    private medicInAnotherRoom(creep: Creep): boolean {
        const squadHealers: Creep[] | null = this.getTowerMedicsInSquad(creep);
        if (!squadHealers) {
            return false;
        }
        const closestSquadMember: Creep | null = creep.pos.findClosestByRange(squadHealers, { filter: (c: Creep) => c.name !== creep.name });
        return closestSquadMember?.room.name === creep.room.name;
    }

    /**
     * Go to the room outside the target room to get healed if needed
     * @param creep the tower tank creep
     * @returns boolean representing if the creep needed to retreat
     */
    private retreatTowerCreep(creep: Creep): boolean {
        if (!Memory.rooms[creep.memory.targetRoom]) {
            return false;
        }
        if (!Game.rooms[creep.memory.targetRoom]) {
            return false;
        }
        if (!creep.room.memory.structures) {
            return false;
        }
        if (!creep.room.memory.structures.data) {
            return false;
        }

        const enemyTowers: StructureTower[] | null = creep.room.memory.structures.data[
            STRUCTURE_TOWER
        ] as StructureTower[];
        if (!enemyTowers) {
            return false;
        }

        if (this.calculateTowerDamage(enemyTowers, creep.pos) * 3 >= creep.hits) {
            // Skip if we're in the enemy room
            if (creep.room.name === creep.memory.targetRoom) {
                return true;
            }

            // Creep is in the adjacent room on exit tile, move away
            if (this.isOnExitTile(creep.pos)) {
                creep.moveTo(new RoomPosition(25, 25, creep.room.name), { range: 15 });
                return true;
            }

            // Creep is off exit tile, stay put until healed up
            return true;
        }

        // Creep doesn't need to retreat
        return creep.hits < creep.hitsMax;
    }

    /**
     * wait to move until the healer is right behind you
     * @param creep the tower drainer creep
     * @returns boolean represetnting if the creep is rallied iwth the healer
     */
    private rallyWithHealer(creep: Creep): boolean {
        const squadHealers: Creep[] | null = this.getTowerMedicsInSquad(creep);
        if (!squadHealers) {
            return true;
        }
        if (!_.every(squadHealers, (c: Creep) => creep.pos.isNearTo(c.pos.x, c.pos.y))) {
            const closestSquadMember: Creep | null = creep.pos.findClosestByRange(squadHealers, { filter: (c: Creep) => c.name !== creep.name });
            if (closestSquadMember) {
                creep.moveTo(closestSquadMember);
            }
            return false;
        }
        return true;
    }

    /**
     * Calculate the amount of damage the towers in the room will do this tick
     * @param enemyTowers an array of the towers in the enemies' room
     * @param creepPos the creep pos we are comparing against
     * @returns the amount of damage the towers will do this tick
     */
    private calculateTowerDamage(enemyTowers: StructureTower[], creepPos: RoomPosition): number {
        let damage: number = 0;
        for (const tower of enemyTowers) {
            damage += RoomHelper_Structure.getTowerDamageAtRange(tower.pos.getRangeTo(creepPos));
        }
        return damage;
    }

    /**
     * Get the healers in the squad
     * @param creep the tower tank creep
     * @param creepOptions the creep's squad options
     */
    private getTowerMedicsInSquad(creep: Creep): Creep[] | null {
        const creepOptions: CreepOptionsMili = creep.memory.options as CreepOptionsMili;
        return MemoryApi_Creep.getCreepsInSquad(creep.room.name, creepOptions.squadUUID!);
    }

    /**
     * check if the creep is on an exit tile
     * @param creepPos the creep's position
     * @returns boolean saying if the creep is on an exit tile
     */
    private isOnExitTile(creepPos: RoomPosition): boolean {
        return creepPos.x === 49 || creepPos.x === 0 || creepPos.y === 0 || creepPos.y === 49;
    }
}
