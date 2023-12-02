import rect from "../src/math/rect";
import { Collision2D } from "../src/physics/Collision2D";
import { QuadTree, QuadTreeAnalytics } from "../src/physics/QuadTree";


test('quadTreeAdd', () => {
    const tree = new QuadTree(10000, 10);

    const collision = new Collision2D('test', new rect([0, 10, 10, 10]));
    const testBlock = new Collision2D('test', new rect([9, 10, 9, 10]));
    tree.addCollision(collision);

    let analytics: QuadTreeAnalytics = { intersectionTests: 0, nodesTested: 0 };
    let results = tree.checkForCollision(testBlock, undefined, analytics);
    console.debug(' analytics ', analytics)
    expect(results.length > 0).toBe(true);

    testBlock.set(10, 10, 10, 10);
    analytics = { intersectionTests: 0, nodesTested: 0 };
    results = tree.checkForCollision(testBlock, undefined, analytics);
    console.debug(' analytics ', analytics);
    expect(results.length > 0).toBe(false);
});

test('quadTreeCheck', () => {
    const tree = new QuadTree(2000, 4);

    // create a 10 x 10 grid of 2x2 colliders
    const step = 2;
    const maxCollision = 1000;
    for (let i = 0; i < maxCollision; i++) {
        for (let j = 0; j < maxCollision; j++) {
            const id = 'test_' + i + ',' + j;
            const collision = new Collision2D(id, new rect([i * step, step, maxCollision - (j * step), step]));
            tree.addCollision(collision);
        }
    }
    const testBlock = new Collision2D('test', new rect([0, 1, 1, 1]));

    var t0 = performance.now();
    let analytics: QuadTreeAnalytics = { intersectionTests: 0, nodesTested: 0 };
    let results = tree.checkForCollision(testBlock, undefined, analytics);
    var t1 = performance.now();

    console.debug(' analytics ', analytics, results);
    console.debug(' time quad tree: ', (t1 - t0));

    expect(results.length > 0).toBe(true);

});

test('slowCheck', () => {

    // create a 10 x 10 grid of 2x2 colliders
    const step = 2;
    const maxCollision = 1000;
    const collisions = [];
    for (let i = 0; i < maxCollision; i++) {
        for (let j = 0; j < maxCollision; j++) {
            const id = 'test_' + i + ',' + j;
            collisions.push(new Collision2D(id, new rect([i * step, step, maxCollision - (j * step), step])));
        }
    }

    const testBlock = new Collision2D('test', new rect([0, 1, 1, 1]));

    var t0 = performance.now();
    collisions.forEach(c => c.isColliding(testBlock.bounds));
    var t1 = performance.now();

    console.debug(' time slow: ', (t1 - t0));
});