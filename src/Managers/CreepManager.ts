import { CREEP_MANAGERS } from "../utils/Interface_Constants";
import UtilHelper from "Helpers/UtilHelper";
import UserException from "utils/UserException";

// Call the creep manager for each role
export default class CreepManager {
    /**
     * loop over all creeps and call single creep manager for it
     */
    public static runCreepManager(): void {
        for (const creep in Game.creeps) {
            try {
                this.runSingleCreepManager(Game.creeps[creep]);
            } catch (e) {
                UtilHelper.printError(e);
            }
        }
    }

    /**
     * run single creep manager
     * @param creep the creep we are calling the manager for
     */
    private static runSingleCreepManager(creep: Creep): void {
        const role = creep.memory.role;

        // If no role provided, throw warning
        if (!role) {
            throw new UserException(
                "Null role provided to run single creep manager",
                "Managers/CreepManager",
                ERROR_ERROR
            );
        }

        // Find the role's object, and call run role on it, and stop the function
        for (const index in CREEP_MANAGERS) {
            if (CREEP_MANAGERS[index].name === role) {
                CREEP_MANAGERS[index].runCreepRole(creep);
                return;
            }
        }
        throw new UserException(
            "Couldn't find ICreepManager implementation for the role",
            "role: " + role + "\nrunSingleCreepManager",
            ERROR_ERROR
        );
    }
}
