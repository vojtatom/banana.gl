import { Group, Box3, Vector3 } from "three";

export function groupCentorid(group: Group) {
    const aabb = new Box3();
    aabb.setFromObject(group);
    const center = aabb.getCenter(new Vector3());
    return center;
}