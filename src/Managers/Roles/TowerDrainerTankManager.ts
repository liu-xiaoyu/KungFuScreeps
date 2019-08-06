import MiliApi from "Api/CreepMili.Api";
import {
    DEFAULT_MOVE_OPTS,
    ROLE_TOWER_TANK,
} from "utils/constants";
import RoomHelper from "Helpers/RoomHelper";
import CreepHelper from "Helpers/CreepHelper";
import CreepApi from "Api/Creep.Api";

// Manager for the miner creep role
export default class TowerDrainerTankCreepManager implements ICreepRoleManager {

    public name: RoleConstant = ROLE_TOWER_TANK;

    constructor() {
        const self = this;
        self.runCreepRole = self.runCreepRole.bind(this);
    }

    /**
     * run the TowerDrainerTank creep
     * @param creep the creep we are running
     */
    public runCreepRole(creep: Creep): void {

        // Check basics for tower drainer before moving on to logic
        if (this.checkTowerTankBasics(creep)) {
            return;
        }

        // Check first if we need to retreat, then (if we're rallied with healer + NOT on an exit tile)
        // Move to the exit tile until these are true, everything is handled within the functions from here
        if (!this.retreatTowerCreep(creep)) {
            if (this.rallyWithHealer(creep) && !this.isOnExitTile(creep.pos)) {
                creep.moveTo(new RoomPosition(25, 25, creep.memory.targetRoom));
            }
        }
    }

    /**
     * Check the basics for tower drainer tank
     * @param creep the tower drainer tank creep
     * @returns boolean representing if the basics need to be handled
     */
    private checkTowerTankBasics(creep: Creep): boolean {
        return false;
    }

    /**
     * Go to the room outside the target room to get healed if needed
     * @param creep the tower tank creep
     * @returns boolean representing if the creep needed to retreat
     */
    private retreatTowerCreep(creep: Creep): boolean {
        if (creep.hits <= creep.hitsMax * .25) {

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
        const squadHealers: Creep[] = this.getTowerMedicsInSquad(creep);
        if (!_.every(squadHealers, (c: Creep) => creep.pos.isNearTo(c.pos.x, c.pos.y))) {
            const closestSquadMember: Creep | null = creep.pos.findClosestByRange(squadHealers);
            if (closestSquadMember) {
                creep.moveTo(closestSquadMember);
            }
            return false;
        }
        return true;
    }

    /**
     * Get the healers in the squad
     * @param creep the tower tank creep
     * @param creepOptions the creep's squad options
     */
    private getTowerMedicsInSquad(creep: Creep): Creep[] {
        return [creep];
    }

    /**
     * check if the creep is on an exit tile
     * @param creepPos the creep's position
     * @returns boolean saying if the creep is on an exit tile
     */
    private isOnExitTile(creepPos: RoomPosition): boolean {
        return (creepPos.x === 49 || creepPos.x === 0 || creepPos.y === 0 || creepPos.y === 49);
    }

}
