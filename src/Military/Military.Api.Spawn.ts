import {
    SQUAD_MANAGERS,
    UserException,
    SpawnApi,
    ERROR_ERROR,
    EmpireHelper,
    MemoryApi_Room
} from "Utils/Imports/internals";

export class Military_Spawn_Api {
    /**
     * Create an instance of a squad manager
     * @param managerType the manager constant of the instance we want to create
     * @param targetRoom the room we want to commence the operation in
     * @param operationUUID the operation uuid
     */
    public static createSquadInstance(managerType: SquadManagerConstant, targetRoom: string, operationUUID: string): void {

        // Find the implementation of the squad instance denoted by the manager type, error if none found
        let managerImplementation: ISquadManager | undefined;
        for (const i in SQUAD_MANAGERS) {
            if (SQUAD_MANAGERS[i].name === managerType) {
                managerImplementation = SQUAD_MANAGERS[i];
                break;
            }
        }
        if (!managerImplementation) {
            throw new UserException(
                "Unhandled squad manager, MilitarySpawnApi/createSquadInstance",
                "tried to handle [" + managerType + "] but no implementation was found.",
                ERROR_ERROR);
        }

        const squadInstance: ISquadManager = managerImplementation.createInstance(
            targetRoom,
            operationUUID
        );

        // Check for existing instance
        // If none, create new operation and push onto memory, If existing, push instance onto it
        let operation: MilitaryOperation | undefined = this.getOperationByUUID(operationUUID);
        if (!operation) {
            const squadData: SquadData = {};
            squadData[squadInstance.squadUUID] = squadInstance;
            operation = {
                squads: squadData,
                operationUUID
            };
            Memory.empire.militaryOperations[operationUUID] = operation;
        }
        else {
            // Loop over military operations, and find a match to push the squad instance onto it
            Memory.empire.militaryOperations[operationUUID].squads[squadInstance.squadUUID] = squadInstance;
        }

        // Add the squad operation to the dependent room's spawn queue
        const squadUUID: string = squadInstance.squadUUID;
        const squadArray: RoleConstant[] = squadInstance.getSquadArray();
        const tickToSpawn: number = Game.time;
        const priority: number = squadInstance.getSpawnPriority();
        this.addSquadToSpawnQueue(squadUUID, operationUUID, squadArray, targetRoom, tickToSpawn, priority);
    }

    /**
     * Get an active operation of with the provided UUID
     * @param operationUUID
     * @returns militaryOperations object with that UUID
     */
    public static getOperationByUUID(operationUUID: string): MilitaryOperation | undefined {
        return Memory.empire.militaryOperations[operationUUID];
    }

    /**
     * Add the squad to the spawn
     * @param squadUUID the squad uuid to reference
     * @param operationUUID the operation uuid to reference
     * @param squadArray the role constant array
     * @param targetRoom the room we are doing the operation in
     * @param tickToSpawn the tick we want to start spawning on the squad
     * @param priority the spawn priority of the bepso
     */
    public static addSquadToSpawnQueue(squadUUID: string, operationUUID: string, squadArray: RoleConstant[], targetRoom: string, tickToSpawn: number, priority: number): void {
        const dependentRoom: string = EmpireHelper.findDependentRoom(targetRoom);
        if (!Memory.rooms[dependentRoom].creepLimit?.militaryQueue) {
            MemoryApi_Room.initCreepLimits(Game.rooms[dependentRoom]);
        }

        // For each member of the squad, create a queue object and add to the dependent room's military queue
        for (const i in squadArray) {
            const role: RoleConstant = squadArray[i];
            const queue: MilitaryQueue = {
                priority,
                tickToSpawn,
                operationUUID,
                squadUUID,
                role
            };
            Memory.rooms[dependentRoom].creepLimit!.militaryQueue.push(queue);
        }
    }

}
