import { Quadtree } from './dataframe.js';

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const tests = [
  {
    name: 'Manual quadrant assignments remain accessible',
    run: () => {
      const qt = new Quadtree(1);

      qt.subdivide();
      qt.getChild(0).setValue(5); // top-left
      qt.getChild(1).setValue(10); // top-right
      qt.getChild(2).setValue(15); // bottom-left
      qt.getChild(3).setValue(20); // bottom-right

      assert(qt.getChild(0).getValue() === 5, 'Top-left value mismatch');
      assert(qt.getChild(1).getValue() === 10, 'Top-right value mismatch');
      assert(qt.getChild(2).getValue() === 15, 'Bottom-left value mismatch');
      assert(qt.getChild(3).getValue() === 20, 'Bottom-right value mismatch');
    },
  },
  {
    name: 'Subdivide and aggregate values',
    run: () => {
      const qt = new Quadtree(1);

      qt.subdivide();
      qt.getChild(0).setValue(2);
      qt.getChild(1).setValue(4);
      qt.getChild(2).setValue(6);
      qt.getChild(3).setValue(8);

      const total =
        qt.getChild(0).getValue() +
        qt.getChild(1).getValue() +
        qt.getChild(2).getValue() +
        qt.getChild(3).getValue();

      assert(total === 20, 'Aggregated total should be 20');
    },
  },
  {
    name: 'Children inherit parent value on subdivide',
    run: () => {
      const qt = new Quadtree(7);
      qt.subdivide();

      assert(qt.isDivided(), 'Quadtree should be divided after subdivide');
      assert(qt.getValue() === null, 'Parent value should be cleared on subdivide');

      for (let i = 0; i < 4; i++) {
        const child = qt.getChild(i);
        assert(child.isLeaf(), `Child ${i} should start as a leaf`);
        assert(child.getValue() === 7, `Child ${i} should inherit the value 7`);
      }
    },
  },
  {
    name: 'setValue clears existing subdivisions',
    run: () => {
      const qt = new Quadtree(0);
      qt.subdivide();
      qt.getChild(0).setValue(1);

      qt.setValue(42);

      assert(qt.isLeaf(), 'Quadtree should be a leaf after setValue');
      assert(qt.getValue() === 42, 'Value should be overwritten by setValue');
      assert(qt.getChild(0) === null, 'Children should be cleared after setValue');
    },
  },
  {
    name: 'mergeIfPossible collapses uniform grandchildren',
    run: () => {
      const qt = new Quadtree(0);
      qt.subdivide();

      for (let i = 0; i < 4; i++) {
        const child = qt.getChild(i);
        child.subdivide();
        for (let j = 0; j < 4; j++) {
          child.getChild(j).setValue(9);
        }
      }

      qt.mergeIfPossible();

      assert(qt.isLeaf(), 'Tree should collapse to a single leaf');
      assert(qt.getValue() === 9, 'Merged value should be propagated upwards');
    },
  },
  {
    name: 'mergeIfPossible preserves heterogeneous quadrants',
    run: () => {
      const qt = new Quadtree(0);
      qt.subdivide();
      qt.getChild(0).setValue(1);
      qt.getChild(1).setValue(2);
      qt.getChild(2).setValue(1);
      qt.getChild(3).setValue(1);

      qt.mergeIfPossible();

      assert(qt.isDivided(), 'Tree should stay subdivided when values differ');
      assert(qt.getValue() === null, 'Parent value should remain null when divided');
    },
  },
  {
    name: 'fillPolygon depth 0 paints when center is inside',
    run: () => {
      const qt = new Quadtree('empty');
      const polygon = [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ];

      qt.fillPolygon(polygon, 'filled', 0);

      assert(qt.getValue() === 'filled', 'Entire area should be filled');
    },
  },
  {
    name: 'fillPolygon depth 0 skips when center is outside',
    run: () => {
      const qt = new Quadtree('initial');
      const polygon = [
        [0, 0],
        [0.2, 0],
        [0, 0.2],
      ];

      qt.fillPolygon(polygon, 'filled', 0);

      assert(qt.getValue() === 'initial', 'Value should remain unchanged');
    },
  },
  {
    name: 'fillPolygon with full coverage collapses tree at deeper depth',
    run: () => {
      const qt = new Quadtree('background');
      const polygon = [
        [-0.1, -0.1],
        [1.1, -0.1],
        [1.1, 1.1],
        [-0.1, 1.1],
      ];

      qt.fillPolygon(polygon, 'foreground', 2);

      assert(qt.isLeaf(), 'Tree should remain a leaf when fully covered');
      assert(qt.getValue() === 'foreground', 'Leaf value should be updated');
    },
  },
];

let failed = false;
tests.forEach((test) => {
  try {
    test.run();
    console.log(`✅ Test "${test.name}" passed.`);
  } catch (e) {
    failed = true;
    console.error(`❌ Test "${test.name}" failed: ${e.message}`);
  }
});

if (failed) {
  process.exitCode = 1;
}
