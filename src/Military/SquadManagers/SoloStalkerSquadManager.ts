import {
    UserException,
    SOLO_STALKER_MAN,
    SpawnApi,
    ROLE_STALKER,
    LOW_PRIORITY,
    MemoryApi_Military
} from "Utils/Imports/internals";

export class SoloStalkerSquadManager implements ISquadManager {
    public name: SquadManagerConstant = SOLO_STALKER_MAN;
    public creeps: string[] = [];
    public targetRoom: string = "";
    public squadUUID: string = "";
    public operationUUID: string = "";

    constructor() {
        const self = this;
        self.runSquad = self.runSquad.bind(this);
        self.createInstance = self.createInstance.bind(this);
        self.getSquadArray = self.getSquadArray.bind(this);
        self.checkStatus = self.checkStatus.bind(this);
        self.addCreep = self.addCreep.bind(this);
        self.creeps = [];
    }

    /**
     * Run the squad manager
     * @param instance the speecific instance of the squad we're running
     */
    public runSquad(instance: ISquadManager): void {

    }

    /**
     * Create an instance and place into the empire memory
     * @param targetRoom the room we are attacking
     */
    public createInstance(targetRoom: string, operationUUID: string): SoloStalkerSquadManager {
        const uuid: string = SpawnApi.generateSquadUUID(operationUUID);
        const instance = new SoloStalkerSquadManager();
        instance.squadUUID = uuid;
        instance.targetRoom = targetRoom;
        instance.operationUUID = operationUUID;
        return instance;
    }

    /**
     * Add a creep to the class
     * @param creep the creep we are adding to the squad
     * @param instance the speecific instance of the squad we're running
     */
    public addCreep(instance: ISquadManager, creepName: string): void {
        MemoryApi_Military.addCreepToSquad(instance.operationUUID, instance.squadUUID, creepName);
    }

    /**
     * Check the status of the squad
     * @param instance the speecific instance of the squad we're running
     * @returns boolean representing the squads current status
     */
    public checkStatus(instance: ISquadManager): number {
        return OK;
    }

    /**
     * Gets the members of the squad in array form
     * @returns array containing all squad member's role constants
     */
    public getSquadArray(): RoleConstant[] {
        return [ROLE_STALKER];
    }

    /**
     * Get the spawn priority of the military squad
     */
    public getSpawnPriority(): number {
        return LOW_PRIORITY;
    }

}
