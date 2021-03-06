import {
    MemoryApi_Military,
    UserException,
    ACTION_MOVE,
    ACTION_RANGED_ATTACK,
    ACTION_HEAL,
    ACTION_ATTACK,
    ACTION_MASS_RANGED,
    ACTION_RANGED_HEAL,
    ERROR_ERROR,
    militaryDataHelper
} from "Utils/Imports/internals";
import { stringify } from "querystring";

export class MilitaryCombat_Api {
    /**
     * Check if the squad has passed away
     * @param instance the squad manager we are checking for
     * @returns boolean representing if the squad is dead
     */
    public static isSquadDead(instance: ISquadManager): boolean {
        const creeps: Array<Creep | undefined> = MemoryApi_Military.getCreepsInSquadByInstance(instance);

        if (creeps.length === 0) {
            return false;
        }

        for (const i in creeps) {
            const creep: Creep | undefined = creeps[i];
            if (creep) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if the room has been taken or hte operation has been stopped
     * @param instance the squad manager we are checking for
     * TODO, tackle on latter half of the military project when we have a more claer picture of direction for it
     */
    public static isOperationDone(instance: ISquadManager): boolean {
        return false;
    }

    /**
     * Run the intents for the squad creep
     * TODO
     * @instance the instance of the squad we're running this from
     * @creep the creep we are commiting the intents for
     */
    public static runIntents(instance: ISquadManager, creep: Creep, roomData: StringMap): void {
        const creepStack = MemoryApi_Military.findCreepInSquadByInstance(instance, creep.name)?.intents;

        if (creepStack === undefined) {
            throw new UserException(
                "Could not find creepStack in runIntents()",
                "Op UUID: " + instance.operationUUID + "\nSquad UUID: " + instance.squadUUID + "\nCreep: " + creep.name,
                ERROR_ERROR
            );
        }

        _.forEach(creepStack, (intent: MiliIntent) => {
            switch (intent.action) {
                case ACTION_MOVE:
                    this.runIntent_MOVE(intent, creep, roomData);
                    break;
                case ACTION_HEAL:
                    this.runIntent_HEAL(intent, creep, roomData);
                    break;
                case ACTION_RANGED_HEAL:
                    this.runIntent_RANGED_HEAL(intent, creep, roomData);
                    break;
                case ACTION_ATTACK:
                    this.runIntent_ATTACK(intent, creep, roomData);
                    break;
                case ACTION_RANGED_ATTACK:
                    this.runIntent_RANGED_ATTACK(intent, creep, roomData);
                    break;
                case ACTION_MASS_RANGED:
                    this.runIntent_MASS_RANGED(intent, creep, roomData);
                    break;
                default:
                    throw new UserException(
                        "Unhandle Action Type in runIntents()",
                        "Attempted to handle action of type: " +
                        intent.action +
                        ", but no implementation has been defined.",
                        ERROR_ERROR
                    );
            }
        });

        return;
    }

    /**
     * Handles the intents of type ACTION_MOVE
     * @param intent The intent to process
     * @param creep The creep to process the intent for
     */
    public static runIntent_MOVE(intent: MiliIntent, creep: Creep, roomData: StringMap): void {
        // TODO Type intents more strongly so that we can handle all cases better
        // * For now I'm only handling directions

        if (intent.targetType === "direction" && typeof (intent.target) === "number" && creep.fatigue === 0) {
            creep.move(intent.target);
        }
    }

    /**
     * Handles the intents of type ACTION_HEAL
     * @param intent The intent to process
     * @param creep The creep to process the intent for
     */
    public static runIntent_HEAL(intent: MiliIntent, creep: Creep, roomData: StringMap): void {

        if (intent.targetType === "creep" && typeof (intent.target) === "string") {
            creep.heal(Game.creeps[intent.target]);
        }
        return;
    }

    /**
     * Handles the intents of type ACTION_RANGED_HEAL
     * @param intent The intent to process
     * @param creep The creep to process the intent for
     */
    public static runIntent_RANGED_HEAL(intent: MiliIntent, creep: Creep, roomData: StringMap): void {
        return;
    }

    /**
     * Handles the intents of type ACTION_ATTACK
     * @param intent The intent to process
     * @param creep The creep to process the intent for
     */
    public static runIntent_ATTACK(intent: MiliIntent, creep: Creep, roomData: StringMap): void {
        return;
    }

    /**
     * Handles the intents of type ACTION_RANGED_ATTACK
     * @param intent The intent to process
     * @param creep The creep to process the intent for
     */
    public static runIntent_RANGED_ATTACK(intent: MiliIntent, creep: Creep, roomData: StringMap): void {

        if (intent.targetType === "creep" && typeof (intent.target) === "string") {
            const target: Creep | null = Game.getObjectById(intent.target);

            if (target === null) {
                throw new UserException("Invalid target passed to runIntent_RANGED_ATTACK", "Target could not be found: " + intent.target, ERROR_ERROR);
            }

            creep.rangedAttack(target);
        }

        return;
    }

    /**
     * Handles the intents of type ACTION_MASS_RANGED
     * @param intent The intent to process
     * @param creep The creep to process the intent for
     */
    public static runIntent_MASS_RANGED(intent: MiliIntent, creep: Creep, roomData: StringMap): void {
        return;
    }

    /**
     * Get the ideal target for a remote defender
     * TODO
     * @param hostiles the hostiles in the room
     * @param creepsInSquad the creeps in the squad
     * @param targetRoom the room we want to find hostiles in
     * @returns creep that we want to target
     */
    public static getRemoteDefenderAttackTarget(hostiles: Creep[] | undefined, creepsInSquad: Creep[], targetRoom: string): Creep | undefined {
        if (!hostiles || !(hostiles?.length > 0) || !(creepsInSquad.length > 0)) {
            return undefined;
        }

        const creepsInTargetRoom: Creep[] = _.filter(creepsInSquad, (c: Creep) => c.room.name === targetRoom);
        let closestEnemy: Creep = hostiles[0];
        let closestDistance: number = militaryDataHelper.getAverageDistanceToTarget(creepsInTargetRoom, closestEnemy);
        for (const i in hostiles) {
            const currentDistance: number = militaryDataHelper.getAverageDistanceToTarget(creepsInTargetRoom, hostiles[i]);
            if (currentDistance < closestDistance) {
                closestEnemy = hostiles[i];
                closestDistance = currentDistance;
            }
        }
        return closestEnemy;
    }

    /**
     * check if the creep is in range to attack the target
     * @param creep the creep we are checking for
     * @param target the room position for the target in question
     * @param isMelee if the creep can only melee
     */
    public static isInAttackRange(creep: Creep, target: RoomPosition, isMelee: boolean): boolean {
        if (isMelee) {
            return creep.pos.isNearTo(target);
        }
        return creep.pos.inRangeTo(target, 3);
    }

    /**
     * moves the creep away from the target
     */
    public static getKitingDirection(creep: Creep, hostileCreep: Creep): DirectionConstant | undefined {
        let path: PathFinderPath;
        const pathFinderOptions: PathFinderOpts = { flee: true };
        const goal: { pos: RoomPosition; range: number } = { pos: hostileCreep.pos, range: 3 };
        path = PathFinder.search(creep.pos, goal, pathFinderOptions);
        if (path.path.length > 0) {
            return creep.pos.getDirectionTo(path.path[0]);
        }
        return undefined;
    }
}
