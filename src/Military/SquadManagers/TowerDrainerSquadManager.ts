import {
    UserException,
    TOWER_DRAINER_MAN,
    SpawnApi,
    ROLE_MEDIC,
    ROLE_TOWER_TANK,
    LOW_PRIORITY,
    MemoryApi_Military,
} from "Utils/Imports/internals";

export class TowerDrainerSquadManager implements ISquadManager {
    public name: SquadManagerConstant = TOWER_DRAINER_MAN;
    public creeps: string[] = [];
    public targetRoom: string = "";
    public squadUUID: string = "";
    public operationUUID: string = "";
    public initialRallyComplete: boolean = false;
    public rallyPos: MockRoomPos | undefined;

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
    public createInstance(targetRoom: string, operationUUID: string): TowerDrainerSquadManager {
        const uuid: string = SpawnApi.generateSquadUUID(operationUUID);
        const instance = new TowerDrainerSquadManager();
        instance.squadUUID = uuid;
        instance.targetRoom = targetRoom;
        instance.operationUUID = operationUUID;
        instance.initialRallyComplete = false;
        instance.rallyPos = undefined
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
    public checkStatus(instance: ISquadManager): SquadStatusConstant {
        return OK;
    }

    /**
     * Gets the members of the squad in array form
     * @returns array containing all squad member's role constants
     */
    public getSquadArray(): SquadDefinition[] {
        const tank1: SquadDefinition = {
            role: ROLE_TOWER_TANK,
            caravanPos: 0
        };
        const medic1: SquadDefinition = {
            role: ROLE_MEDIC,
            caravanPos: 1
        };
        return [tank1, medic1];
    }

    /**
     * Get the spawn priority of the military squad
     */
    public getSpawnPriority(): number {
        return LOW_PRIORITY;
    }

}
