// True corner: blocks share exactly one corner point
// That means they touch diagonally: one block's corner == another block's corner
// Cases:
//   A bottom-right == B top-left: (a.x+a.w == b.x) && (a.y+a.h == b.y)
//   A bottom-left == B top-right: (a.x == b.x+b.w) && (a.y+a.h == b.y)
//   A top-right == B bottom-left: (a.x+a.w == b.x) && (a.y == b.y+b.h)
//   A top-left == B bottom-right: (a.x == b.x+b.w) && (a.y == b.y+b.h)

function isCorner(a, b) {
  return (
    (a.x + a.w === b.x && a.y + a.h === b.y) ||  // A bottom-right → B top-left
    (a.x === b.x + b.w && a.y + a.h === b.y) ||  // A bottom-left → B top-right
    (a.x + a.w === b.x && a.y === b.y + b.h) ||  // A top-right → B bottom-left
    (a.x === b.x + b.w && a.y === b.y + b.h)     // A top-left → B bottom-right
  );
}

// From test output: Pair 0→1 with cornerAmount=1
const a = {x:0, y:13, w:2, h:3};
const b = {x:2, y:12, w:6, h:1};
console.log('isCorner (old test pair):', isCorner(a, b));

// True corner example
const c = {x:0, y:3, w:3, h:3};  // bottom at y+h=6
const d = {x:3, y:6, w:3, h:3};  // top at y=6
console.log('true corner (bottom-right → top-left):', isCorner(c, d)); // should be true

const e = {x:0, y:3, w:3, h:3};
const f = {x:2, y:6, w:3, h:3}; // overlapping horizontally
console.log('horizontal edge (not corner):', isCorner(e, f)); // should be false
