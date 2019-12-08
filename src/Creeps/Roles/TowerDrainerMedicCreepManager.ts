import {
    ROLE_TOWER_MEDIC,
} from "Utils/Imports/constants";

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

        const creepOptions: CreepOptionsMili = creep.memory.options as CreepOptionsMili;
        const CREEP_RANGE: number = 1;

    }

    /**
     * Check creep basics for tower medic
     * @param creep the tower medic creep
     */
    private checkTowerMedicBasics(creep: Creep): void {

    }

    /**
     * Rally the creep with the tower tank
     * @param creep the tower medic creep
     */
    private rallyWithTank(creep: Creep): void {

    }

    /**
     * Get the tower tanks target position
     * @param creep the tower medic creep
     */
    private getTargetPosition(creep: Creep): void {

    }

    /**
     * Get the tower tank in your squad
     * @param creep the tower medic creep
     */
    private getTowerTankInSquad(creep: Creep): Creep[] {
        return [creep];
    }

    /**
     * Move in formation with the tower tank
     * @param creep the tower medic creep
     * @param towerTank the tower tank
     */
    private moveInFormation(creep: Creep): void {

    }
}
