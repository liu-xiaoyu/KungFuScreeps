import {
    SQUAD_MANAGERS,
    UserException,
    SpawnApi,
    ERROR_ERROR
} from "Utils/Imports/internals";

export class Military_Spawn_Api {
    /**
     * Create an instance of a squad manager
     * @param managerType the manager constant of the instance we want to create
     * @param targetRoom the room we want to commence the operation in
     * @param operationUUID the operation uuid
     */
    public static createSquadInstance(managerType: SquadManagerConstant, targetRoom: string, operationUUID: number): void {

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
            operation = {
                squads: [squadInstance],
                operationUUID
            };
            Memory.empire.militaryOperations.push(operation);
        }
        else {
            // Loop over military operations, and find a match to push the squad instance onto it
            const allOperations: MilitaryOperation[] = Memory.empire.militaryOperations;
            for (const i in allOperations) {
                if (allOperations[i].operationUUID === operationUUID) {
                    allOperations[i].squads.push(squadInstance);
                    break;
                }
            }
            // Update memory reference
            Memory.empire.militaryOperations = allOperations;
        }
    }

    /**
     * Get an active operation of with the provided UUID
     * @param operationUUID
     * @returns militaryOperations object with that UUID
     */
    public static getOperationByUUID(operationUUID: number): MilitaryOperation | undefined {
        return _.find(Memory.empire.militaryOperations,
            (op: MilitaryOperation) => op.operationUUID === operationUUID
        );
    }
}
