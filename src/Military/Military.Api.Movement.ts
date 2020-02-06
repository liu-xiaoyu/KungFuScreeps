import { MemoryApi_Military, UtilHelper, Normalize, UserException, ERROR_ERROR } from "Utils/Imports/internals";

export class MilitaryMovment_Api {

    /**
     * Check if every creep in the squad is at the rally point in their proper position
     * TODO
     * @param instance the squad instance we're using to check
     */
    public static isSquadRallied(instance: ISquadManager): boolean {
        const creeps: Array<Creep | undefined> = MemoryApi_Military.getCreepsInSquadByInstance(instance);
        const operation: MilitaryOperation | undefined = MemoryApi_Military.getOperationByUUID(instance.operationUUID);
        if (!instance.rallyPos) {
            return true;
        }
        const rallyPos: RoomPosition = Normalize.convertMockToRealPos(instance.rallyPos);
        for (const i in creeps) {
            const creep: Creep | undefined = creeps[i];
            if (!creep) {
                continue;
            }

            const creepOptions: CreepOptionsMili = creep.memory.options as CreepOptionsMili;
            if (!creepOptions.caravanPos) {
                throw new UserException(
                    "Undefined caravanPos in squadRally Method",
                    "Creep [ " + creep.name + " ].",
                    ERROR_ERROR
                );
            }

            // If any creep is NOT in their caravanPos range of the rally position, we aren't rallied
            if (!creep.pos.inRangeTo(rallyPos, creepOptions.caravanPos)) {
                return false;
            }
        }

        // We make it here, everyones rallied
        return true;
    }
}
