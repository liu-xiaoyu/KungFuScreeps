import {
    SQUAD_MANAGERS,
    UserException,
    ERROR_ERROR,
    EmpireHelper,
    MemoryApi_Room,
    MemoryApi_Military
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
        const managerImplementation: ISquadManager | undefined = MemoryApi_Military.getSingletonSquadManager(managerType);
        const squadInstance: ISquadManager = managerImplementation.createInstance(
            targetRoom,
            operationUUID
        );

        // Check for existing instance
        // If none, create new operation and push onto memory, If existing, push instance onto it
        let operation: MilitaryOperation | undefined = MemoryApi_Military.getOperationByUUID(operationUUID);
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
        const squadArray: SquadDefinition[] = squadInstance.getSquadArray();
        const tickToSpawn: number = Game.time;
        const priority: number = squadInstance.getSpawnPriority();
        this.addSquadToSpawnQueue(squadUUID, operationUUID, squadArray, targetRoom, tickToSpawn, priority);
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
    public static addSquadToSpawnQueue(squadUUID: string, operationUUID: string, squadArray: SquadDefinition[], targetRoom: string, tickToSpawn: number, priority: number): void {
        const dependentRoom: string = EmpireHelper.findDependentRoom(targetRoom);
        if (!Memory.rooms[dependentRoom].creepLimit?.militaryQueue) {
            MemoryApi_Room.initCreepLimits(Game.rooms[dependentRoom]);
        }

        // For each member of the squad, create a queue object and add to the dependent room's military queue
        for (const i in squadArray) {
            const role: SquadDefinition = squadArray[i];
            const queue: MilitaryQueue = {
                priority,
                tickToSpawn,
                operationUUID,
                squadUUID,
                role: role.role,
                caravanPos: role.caravanPos
            };
            Memory.rooms[dependentRoom].creepLimit!.militaryQueue.push(queue);
        }
    }
}
