import MemoryApi from "../../Api/Memory.Api";
import CreepApi from "Api/Creep.Api";

// Manager for the miner creep role
export default class HarvesterCreepManager {
    /**
     * run the harvester creep
     * @param creep the creep we are running
     */
    public static runCreepRole(creep: Creep): void {
        if (creep.spawning) {
            return; // don't do anything until spawned
        }

        const homeRoom: Room = Game.rooms[creep.memory.homeRoom];

        if (creep.memory.job === undefined) {
            creep.memory.job = this.getNewJob(creep, homeRoom);

            if (creep.memory.job === undefined) {
                return; // idle for a tick
            }

            this.handleNewJob(creep);
        }

        if (creep.memory.job) {
            if (creep.memory.working) {
                CreepApi.doWork(creep, creep.memory.job);
                return;
            }

            CreepApi.travelTo(creep, creep.memory.job);
        }
    }

    /**
     * Decides which kind of job to get and calls the appropriate function
     */
    public static getNewJob(creep: Creep, room: Room): BaseJob | undefined {
        // if creep is empty, get a GetEnergyJob
        if (creep.carry.energy === 0) {
            return this.newGetEnergyJob(creep, room);
        } else {
            let job: BaseJob | undefined = this.newCarryPartJob(creep, room);
            if (job === undefined) {
                job = this.newWorkPartJob(creep, room);
            }

            return job;
        }
    }

    /**
     * Get a GetEnergyJob for the harvester
     */
    public static newGetEnergyJob(creep: Creep, room: Room): GetEnergyJob | undefined {
        const creepOptions: CreepOptionsCiv = creep.memory.options as CreepOptionsCiv;
        if (creepOptions.getFromContainer) {
            // All container jobs with enough energy to fill creep.carry, and not taken
            const containerJobs = MemoryApi.getContainerJobs(
                room,
                (cJob: GetEnergyJob) => !cJob.isTaken && cJob.resources!.energy >= creep.carryCapacity
            );

            if (containerJobs.length > 0) {
                return containerJobs[0];
            }
        }

        if (creepOptions.getDroppedEnergy) {
            // All dropped resources with enough energy to fill creep.carry, and not taken
            const dropJobs = MemoryApi.getPickupJobs(
                room,
                (dJob: GetEnergyJob) => !dJob.isTaken && dJob.resources!.energy >= creep.carryCapacity
            );

            if (dropJobs.length > 0) {
                return dropJobs[0];
            }
        }

        if (creepOptions.getFromStorage || creepOptions.getFromTerminal) {
            // All backupStructures with enough energy to fill creep.carry, and not taken
            const backupStructures = MemoryApi.getBackupStructuresJobs(
                room,
                (job: GetEnergyJob) => !job.isTaken && job.resources!.energy >= creep.carryCapacity
            );

            if (backupStructures.length > 0) {
                return backupStructures[0];
            }

            return undefined;
        }

        return undefined;
    }

    /**
     * Get a CarryPartJob for the harvester
     */
    public static newCarryPartJob(creep: Creep, room: Room): CarryPartJob | undefined {
        const creepOptions: CreepOptionsCiv = creep.memory.options as CreepOptionsCiv;

        if (creepOptions.fillTower || creepOptions.fillSpawn) {
            const fillJobs = MemoryApi.getFillJobs(room, (fJob: CarryPartJob) => !fJob.isTaken && fJob.targetType !== 'link', true);

            if (fillJobs.length > 0) {
                return fillJobs[0];
            }
        }

        if (creepOptions.fillStorage || creepOptions.fillContainer) {
            const storeJobs = MemoryApi.getStoreJobs(room, (bsJob: CarryPartJob) => !bsJob.isTaken);

            if (storeJobs.length > 0) {
                return storeJobs[0];
            }

            return undefined;
        }

        return undefined;
    }

    /**
     * Gets a new WorkPartJob for harvester
     */
    public static newWorkPartJob(creep: Creep, room: Room): WorkPartJob | undefined {
        const creepOptions: CreepOptionsCiv = creep.memory.options as CreepOptionsCiv;
        const upgradeJobs = MemoryApi.getUpgradeJobs(room, (job: WorkPartJob) => !job.isTaken);

        if (creepOptions.upgrade) {
            if (upgradeJobs.length > 0) {
                return upgradeJobs[0];
            }
        }

        if (creepOptions.build) {
            const buildJobs = MemoryApi.getBuildJobs(room, (job: WorkPartJob) => !job.isTaken);
            if (buildJobs.length > 0) {
                return buildJobs[0];
            }

        }

        return undefined;
    }

    /**
     * Handles setup for a new job
     */
    public static handleNewJob(creep: Creep): void {
        if (creep.memory.job!.jobType === "getEnergyJob") {
            // TODO Decrement the energy available in room.memory.job.xxx.yyy by creep.carryCapacity
            return;
        }
        else if (creep.memory.job!.jobType === "carryPartJob") {
            // Find the reference to the job we currently have and mark it as taken
            return;
        }
    }
}