import {IId} from "./iid";

/**
 * The minimum requirements for an edge.
 * @interface
 */
export   class IEdgeBase extends IId {
    sourceId;
    targetId;

    toJSON(){}
}

