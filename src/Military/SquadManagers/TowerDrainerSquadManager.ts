import {
    UserException,
    TOWER_DRAINER_MAN,
    SpawnApi,
    ROLE_MEDIC,
    ROLE_TOWER_TANK,
    LOW_PRIORITY,
} from "Utils/Imports/internals";

export class TowerDrainerSquadManager implements ISquadManager {
    public name: SquadManagerConstant = TOWER_DRAINER_MAN;
    public creeps: Creep[] = [];
    public targetRoom: string = "";
    public squadUUID: number = 0;
    public operationUUID: number = 0;

    constructor() {
        const self = this;
        self.runSquad = self.runSquad.bind(this);
        self.createInstance = self.createInstance.bind(this);
        self.getSquadArray = self.getSquadArray.bind(this);
        self.checkStatus = self.checkStatus.bind(this);
        self.creeps = [];
    }

    /**
     * Run the squad manager
     */
    public runSquad(): void {

    }

    /**
     * Create an instance and place into the empire memory
     * @param targetRoom the room we are attacking
     */
    public createInstance(targetRoom: string, operationUUID: number): TowerDrainerSquadManager {
        const uuid: number = SpawnApi.generateSquadUUID();
        const instance = new TowerDrainerSquadManager();
        instance.squadUUID = uuid;
        instance.targetRoom = targetRoom;
        instance.operationUUID = operationUUID;
        return instance;
    }

    /**
     * Add a creep to the class
     * @param creep the creep we are adding to the squad
     */
    public addCreep(creep: Creep): void {
        this.creeps.push(creep);
    }

    /**
     * Check the status of the squad
     * @returns boolean representing the squads current status
     */
    public checkStatus(): number {
        return OK;
    }

    /**
     * Gets the members of the squad in array form
     * @returns array containing all squad member's role constants
     */
    public getSquadArray(): RoleConstant[] {
        return [ROLE_TOWER_TANK, ROLE_MEDIC];
    }

    /**
     * Get the spawn priority of the military squad
     */
    public getSpawnPriority(): number {
        return LOW_PRIORITY;
    }

}
