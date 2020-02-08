import {
    MemoryApi_Military,
    UserException,
    ACTION_MOVE,
    ACTION_RANGED_ATTACK,
    ACTION_HEAL,
    ACTION_ATTACK,
    ACTION_MASS_RANGED,
    ACTION_RANGED_HEAL
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

        if (intent.targetType === "direction" && typeof(intent.target) === "number") {
            creep.move(intent.target);
        }
    }

    /**
     * Handles the intents of type ACTION_HEAL
     * @param intent The intent to process
     * @param creep The creep to process the intent for
     */
    public static runIntent_HEAL(intent: MiliIntent, creep: Creep, roomData: StringMap): void {

        if(intent.targetType === "creep" && typeof(intent.target) === "string") {
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

        if(intent.targetType === "creep" && typeof(intent.target) === "string") {
            creep.rangedAttack(Game.creeps[intent.target]);
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
    
}
