import { CREEP_CIV_MANAGERS, CREEP_MILI_MANAGERS, ALL_CIVILIAN_ROLES, ALL_REMOTE_ROLES, ALL_MILITARY_ROLES, ERROR_ERROR, UtilHelper, UserException, CreepApi } from "utils/internals";

// Call the creep manager for each role
export class CreepManager {
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
        const role: RoleConstant = creep.memory.role;

        // If no role provided, throw warning
        if (!role) {
            throw new UserException(
                "Null role provided to run single creep manager",
                "Managers/CreepManager",
                ERROR_ERROR
            );
        }

        // Don't run the creep if they are still spawning
        if (creep.spawning) {
            return;
        }

        // Decide what interface to call to run the creep, and subsequently find the implementation
        // Of the helper functions within the creep manager files
        if (ALL_CIVILIAN_ROLES.includes(role)) {
            this.runSingleCivCreepManager(creep, role);
            return;
        }
        else if (ALL_MILITARY_ROLES.includes(role)) {
            this.runSingleMiliCreepManager(creep, role);
            return;
        }

        throw new UserException(
            "Creep we tried to run manager for is not defined in the constants array",
            "role: " + role + "\nrunSingleCreepManager",
            ERROR_ERROR
        );
    }

    /**
     * Run the civilian creep managerss
     * @param creep the creep we want to run
     */
    private static runSingleCivCreepManager(creep: Creep, role: RoleConstant): void {

        // Attempt to find a manager implementation of the support functions we need
        const homeRoom: Room = Game.rooms[creep.memory.homeRoom];
        let managerImplementation: ICivCreepRoleManager | undefined;
        for (const i in CREEP_CIV_MANAGERS) {
            if (CREEP_CIV_MANAGERS[i].name === role) {
                managerImplementation = CREEP_CIV_MANAGERS[i];
            }
        }

        // Throw exception if we couldn't find one
        if (!managerImplementation) {
            throw new UserException(
                "Couldn't find ICreepManager implementation for the role",
                "role: " + role + "\nrunSingleCreepManager",
                ERROR_ERROR
            );
        }

        // Check if the remote creep should flee
        if (ALL_REMOTE_ROLES.includes(role)) {
            if (CreepApi.creepShouldFlee(creep)) {
                CreepApi.fleeRemoteRoom(creep, homeRoom);
            }
        }


        if (creep.memory.job === undefined) {
            creep.memory.job = managerImplementation!.getNewJob(creep, homeRoom);

            if (creep.memory.job === undefined) {
                return; // idle for a tick
            }

            // Set supplementary.moveTarget to container if one exists and isn't already taken
            managerImplementation!.handleNewJob(creep, homeRoom);
        }

        if (!creep.memory.working) {
            CreepApi.travelTo(creep, creep.memory.job);
        }

        if (creep.memory.working) {
            CreepApi.doWork(creep, creep.memory.job);
            return;
        }
    }

    /**
     * Run the civilian creep managerss
     * @param creep the creep we want to run
     */
    private static runSingleMiliCreepManager(creep: Creep, role: RoleConstant): void {
        for (const i in CREEP_MILI_MANAGERS) {
            if (CREEP_MILI_MANAGERS[i].name === role) {
                CREEP_MILI_MANAGERS[i].runCreepRole(creep);
            }
        }
    }
}
