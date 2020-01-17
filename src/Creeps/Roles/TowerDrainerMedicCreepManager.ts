import {
    ROLE_TOWER_MEDIC,
} from "Utils/Imports/constants";
import { MemoryApi_Creep } from "Memory/Memory.Creep.Api";
import { CreepAllApi } from "Creeps/Creep.All.Api";

// Manager for the miner creep role
export class TowerDrainerMedicCreepManager implements IMiliCreepRoleManager {

    public name: RoleConstant = ROLE_TOWER_MEDIC;

    constructor() {
        const self = this;
        self.runCreepRole = self.runCreepRole.bind(this);
    }

    /**
     * run the TowerDrainerMedic creep
     * @param creep the creep we are running
     */
    public runCreepRole(creep: Creep): void {

        // TODO
        // They move every other tick, make them smarter and move as a unit, possibly call an abstracted function together?
        // Check if we're in position to heal
        if (this.inHealingPosition(creep)) {

            const squadTank: Creep[] | null = this.getTowerTanksInSquad(creep);
            if (!squadTank) {
                return;
            }
            const closestSquadMember: Creep | null = creep.pos.findClosestByRange(squadTank);
            if (!closestSquadMember || (creep.memory.targetRoom !== closestSquadMember.memory.targetRoom)) {
                return;
            }
            // If we're next to the creep, and it needs heal, heal it
            if (creep.pos.isNearTo(closestSquadMember)) {
                if (closestSquadMember.hits < closestSquadMember.hitsMax) {
                    creep.heal(closestSquadMember);
                }
            }
        }
        else {
            // We aren't in healing position yet, move with the tank
            if (this.isOnExitTile(creep.pos)) {
                CreepAllApi.moveCreepOffExit(creep);
            }
            else {
                this.rallyWithTank(creep);
            }
        }
    }

    /**
     * check if the creep is on an exit tile
     * @param creepPos the creep's position
     * @returns boolean saying if the creep is on an exit tile
     */
    private isOnExitTile(creepPos: RoomPosition): boolean {
        return creepPos.x === 49 || creepPos.x === 0 || creepPos.y === 0 || creepPos.y === 49;
    }

    /**
     * Check if we are in our static position to heal
     * @param creep the creep we are performing
     * @returns boolean representing if we are in our healing spot
     */
    private inHealingPosition(creep: Creep): boolean {
        const path: PathStep[] = creep.pos.findPathTo(new RoomPosition(25, 25, creep.memory.targetRoom), { range: 24 });
        if (!path) {
            return false;
        }
        const exits: ExitsInformation = Game.map.describeExits(creep.memory.targetRoom);
        const targetRoom: string = creep.memory.targetRoom;
        const isInAdjRoom: boolean = (
            exits[1] === targetRoom ||
            exits[3] === targetRoom ||
            exits[5] === targetRoom ||
            exits[7] === targetRoom
        );
        return path!.length < 3 && isInAdjRoom;
    }

    /**
     * Rally the creep with the tower tank
     * @param creep the tower medic creep
     */
    private rallyWithTank(creep: Creep): boolean {
        const squadTank: Creep[] | null = this.getTowerTanksInSquad(creep);
        if (!squadTank) {
            return true;
        }
        if (!_.every(squadTank, (c: Creep) => creep.pos.isNearTo(c.pos.x, c.pos.y))) {
            const closestSquadMember: Creep | null = creep.pos.findClosestByRange(squadTank, { filter: (c: Creep) => c.name !== creep.name });
            if (closestSquadMember) {
                creep.moveTo(closestSquadMember.pos);
            }
            return false;
        }
        return true;
    }

    /**
     * Get the other squad members to the healer
     * @param creep the creep we are checking for squad members for
     */
    private getTowerTanksInSquad(creep: Creep): Creep[] | null {
        const creepOptions: CreepOptionsMili = creep.memory.options as CreepOptionsMili;
        return MemoryApi_Creep.getCreepsInSquad(creep.room.name, creepOptions.squadUUID!);
    }
}
