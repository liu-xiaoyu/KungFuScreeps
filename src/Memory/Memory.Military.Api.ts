import { SQUAD_MANAGERS, UserException } from "Utils/Imports/internals";

export class MemoryApi_Military {

    /**
     * Get an active operation of with the provided UUID
     * @param operationUUID
     * @returns militaryOperations object with that UUID
     */
    public static getOperationByUUID(operationUUID: string): MilitaryOperation | undefined {
        return Memory.empire.militaryOperations[operationUUID];
    }

    /**
     * Get an active squad with the provided UUIDs
     * @param operationUUID the operation id
     * @param squadUUID the squad id
     * @returns the squad we are referencing
     */
    public static getSquadByUUIDs(operationUUID: string, squadUUID: string): ISquadManager | undefined {
        return Memory.empire.militaryOperations[operationUUID].squads[squadUUID];
    }

    /**
     * Get creeps in squad by uuids
     * @param operationUUID
     * @param squadUUID
     * @returns array of creeps in the squad
     */
    public static getCreepsInSquad(operationUUID: string, squadUUID: string): Creep[] | undefined {
        const creepNames: string[] | undefined = this.getSquadByUUIDs(operationUUID, squadUUID)?.creeps;
        if (!creepNames) {
            return undefined;
        }

        const creeps: Creep[] = [];
        for (const i in creepNames) {
            if (!creepNames[i]) {
                continue;
            }
            if (!Game.creeps[creepNames[i]]) {
                continue;
            }

            creeps.push(Game.creeps[creepNames[i]]);
        }

        return creeps;
    }

    /**
     * Add Creep to squad
     * @param operationUUID
     * @param squadUUID
     */
    public static addCreepToSquad(operationUUID: string, squadUUID: string, creepName: string): void {
        Memory.empire.militaryOperations[operationUUID].squads[squadUUID].creeps.push(creepName);
    }

    /**
     * Remove Creep from squad
     * TODO
     * @param operationUUID
     * @param squadUUID
     */
    public static removeCreepFromSquad(operationUUID: string, squadUUID: string, creepName: string): void {
        return;
    }

    /**
     * Return the master implementation in the code for the specfici instance
     * this is so we can call implementation functions on it
     * @param managerType the specific implementation we are loooking for
     */
    public static getSingletonSquadManager(managerType: SquadManagerConstant): ISquadManager {
        for (const i in SQUAD_MANAGERS) {
            if (SQUAD_MANAGERS[i].name === managerType) {
                return SQUAD_MANAGERS[i];
            }
        }

        throw new UserException(
            "Unhandled squad manager, MemoryMilitaryApi/getSingletonSquadManager",
            "tried to handle [" + managerType + "] but no implementation was found.",
            ERROR_ERROR
        );
    }
}
