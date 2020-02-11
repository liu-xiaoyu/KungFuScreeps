import { MemoryApi_Military, MilitaryCombat_Api, MilitaryMovment_Api, ACTION_MOVE } from "Utils/Imports/internals";
import { MilitaryMovement_Helper } from "./Military.Movement.Helper";

export class MilitaryIntents_Api {

    /**
     * Reset the intents for the squad
     * @param instance the squad instance we are referring to
     */
    public static resetSquadIntents(instance: ISquadManager): void {
        const creeps = MemoryApi_Military.getLivingCreepsInSquadByInstance(instance);

        _.forEach(creeps, (creep: Creep) => {
            const creepStack = MemoryApi_Military.findCreepInSquadByInstance(instance, creep.name);

            if (creepStack === undefined) {
                return;
            }

            creepStack.intents = [];
        });
    }

    /**
     * Queue an intent to move off the exit tile
     * @param creep
     * @param instance the squad the creep is apart of
     * @returns boolean representing if we queued the intent
     */
    public static queueIntentMoveOffExitTile(creep: Creep, instance: ISquadManager): boolean {
        const directionOffExitTile: DirectionConstant | undefined = MilitaryMovment_Api.getDirectionOffExitTile(creep);
        if (!directionOffExitTile) {
            return false;
        }

        const intent: MiliIntent = {
            action: ACTION_MOVE,
            target: directionOffExitTile,
            targetType: "direction"
        };

        const creepStack: SquadStack | undefined = MemoryApi_Military.findCreepInSquadByInstance(instance, creep.name);

        if (creepStack === undefined) {
            return false;
        }

        creepStack.intents.push(intent);
        return true;
    }

    /**
     * Queue intents to get to the target room
     * @param creep the creep we're controlling
     * @param instance the instance that the creep is in
     * @returns boolean representing if we queued an intent
     */
    public static queueIntentMoveToTargetRoom(creep: Creep, instance: ISquadManager): boolean {
        const path = creep.pos.findPathTo(new RoomPosition(25, 25, instance.targetRoom), { range: 25 });
        const directionToTarget = path[0].direction;
        const intent: MiliIntent = {
            action: ACTION_MOVE,
            target: directionToTarget,
            targetType: "direction"
        };
        const creepStack: SquadStack | undefined = MemoryApi_Military.findCreepInSquadByInstance(instance, creep.name);
        if (creepStack === undefined) {
            return false;
        }
        creepStack.intents.push(intent);
        return true;
    }

    /**
     * Queue the kiting intent for an enemy creep
     * @param creep the creep we're queueing the intent for
     * @param targetHostile the hostile we want to kite
     * @param instance the squad instance we're controlling
     * @returns boolean representing if we queued an intent
     */
    public static queueIntentMoveTargetKiting(creep: Creep, targetHostile: Creep | undefined, instance: ISquadManager): boolean {
        if (targetHostile) {
            if (MilitaryCombat_Api.isInAttackRange(creep, targetHostile.pos, false)) {
                const directionToTarget = MilitaryCombat_Api.getKitingDirection(creep, targetHostile);

                if (!directionToTarget) {
                    return false;
                }

                const intent: MiliIntent = {
                    action: ACTION_MOVE,
                    target: directionToTarget,
                    targetType: "direction"
                };
                const creepStack: SquadStack | undefined = MemoryApi_Military.findCreepInSquadByInstance(instance, creep.name);
                if (creepStack === undefined) {
                    return false;
                }
                creepStack.intents.push(intent);
                return true;
            }
            else {
                const path = creep.pos.findPathTo(targetHostile.pos, { range: 3 });
                const directionToTarget = path[0].direction;
                const intent: MiliIntent = {
                    action: ACTION_MOVE,
                    target: directionToTarget,
                    targetType: "direction"
                };
                const creepStack: SquadStack | undefined = MemoryApi_Military.findCreepInSquadByInstance(instance, creep.name);
                if (creepStack === undefined) {
                    return false;
                }
                creepStack.intents.push(intent);
                return true;
            }
        }
        return false;
    }

    /**
     * Kite an enemy next to us
     * @param creep the creep we're controlling
     *
     */
    public static queueIntentMoveNearHostileKiting(creep: Creep, instance: ISquadManager): boolean {

        const closeEnemy: Creep | null = creep.pos.findClosestByPath(creep.room.find(FIND_HOSTILE_CREEPS));
        if (closeEnemy && MilitaryCombat_Api.isInAttackRange(creep, closeEnemy.pos, false)) {
            const directionToTarget = MilitaryCombat_Api.getKitingDirection(creep, closeEnemy);
            if (!directionToTarget) {
                return false;
            }
            const intent: MiliIntent = {
                action: ACTION_MOVE,
                target: directionToTarget,
                targetType: "direction"
            };

            const creepStack: SquadStack | undefined = MemoryApi_Military.findCreepInSquadByInstance(instance, creep.name);

            if (creepStack === undefined) {
                return false;
            }

            creepStack.intents.push(intent);
            return true;
        }
        return false;
    }
}
