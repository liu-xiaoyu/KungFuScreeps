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

        const creepOptions: CreepOptionsMili = creep.memory.options as CreepOptionsMili;
        const CREEP_RANGE: number = 1;


    }

    /**
     * Check the basics for tower drainer tank
     * @param creep the tower drainer tank creep
     */
    private checkTowerTankBasics(creep: Creep): void {

    }

    /**
     * Go to the room outside the target room to get healed if needed
     * @param creep the tower tank creep
     * @param creepOptions the creep squad options
     * @returns boolean representing if the creep needed to retreat
     */
    private retreatTowerCreep(creep: Creep, creepOptions: CreepOptionsMili): boolean {
        if (creep.hits <= (this.calculateTowerDamage(creep) * 3)) {
            // Skip if creep is in the target room
            if (creep.room.name === creep.memory.targetRoom) {
                return true;
            }

            // Creep is in the adjacent room on exit tile, move away
            if (creep.pos.x === 0 || creep.pos.y === 0 || creep.pos.x === 49 || creep.pos.y === 49) {
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
     */
    private rallyWithHealer(creep: Creep): void {

    }

    /**
     * Choose the room position on the exit to sit on
     * Get from memory if it was already found
     * @param creep the tower drainer creep
     */
    private getTargetPosition(creep: Creep): void {

    }

    /**
     * Calculate the tower damage in the target room
     * @param creep the tower drainer creep
     */
    private calculateTowerDamage(creep: Creep): number {
        return 1;
    }

    /**
     * Get the healers in the squad
     * @param creep the tower tank creep
     * @param creepOptions the creep's squad options
     */
    private getTowerMedicsInSquad(creep: Creep): Creep[] {
        return [creep];
    }
}
