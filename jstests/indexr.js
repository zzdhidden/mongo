// Check multikey index cases with parallel nested fields SERVER-958.

t = db.jstests_indexr;
t.drop();

// Check without indexes.
t.save( { a: [ { b: 3, c: 6 }, { b: 1, c: 1 } ] } );
assert.eq( 1, t.count( { 'a.b':{ $gt:2 }, 'a.c': { $lt:4 } } ) );
assert.eq( 1, t.count( { a:{ b:3, c:6 }, 'a.c': { $lt:4 } } ) );

// Check with single key indexes.
t.remove();
t.ensureIndex( {'a.b':1,'a.c':1} );
t.ensureIndex( {a:1,'a.c':1} );
assert.eq( 0, t.count( { 'a.b':{ $gt:2 }, 'a.c': { $lt:4 } } ) );
assert.eq( 0, t.count( { a:{ b:3, c:6 }, 'a.c': { $lt:4 } } ) );
assert.eq( 4, t.find( { 'a.b':{ $gt:2 }, 'a.c': { $lt:4 } } ).explain().indexBounds['a.c'][0][1] );
assert.eq( 4, t.find( { a:{ b:3, c:6 }, 'a.c': { $lt:4 } } ).explain().indexBounds['a.c'][0][1] );

t.save( { a: { b: 3, c: 3 } } );
assert.eq( 1, t.count( { 'a.b':{ $gt:2 }, 'a.c': { $lt:4 } } ) );
assert.eq( 1, t.count( { a:{ b:3, c:3 }, 'a.c': { $lt:4 } } ) );
assert.eq( 4, t.find( { 'a.b':{ $gt:2 }, 'a.c': { $lt:4 } } ).explain().indexBounds['a.c'][0][1] );
assert.eq( 4, t.find( { a:{ b:3, c:3 }, 'a.c': { $lt:4 } } ).explain().indexBounds['a.c'][0][1] );

// Check with multikey indexes.
t.remove();
t.save( { a: [ { b: 3, c: 6 }, { b: 1, c: 1 } ] } );

assert.eq( 1, t.count( { 'a.b':{ $gt:2 }, 'a.c': { $lt:4 } } ) );
if ( 0 ) { // SERVER-3005
assert.eq( 1, t.count( { a:{ b:3, c:6 }, 'a.c': { $lt:4 } } ) );
}
assert.eq( [[{$minElement:1},{$maxElement:1}]], t.find( { 'a.b':{ $gt:2 }, 'a.c': { $lt:4 } } ).explain().indexBounds['a.c'] );
assert.eq( [[{$minElement:1},{$maxElement:1}]], t.find( { a:{ b:3, c:6 }, 'a.c': { $lt:4 } } ).explain().indexBounds['a.c'] );

// Check reverse direction.
assert.eq( 1, t.find( { 'a.b':{ $gt:2 }, 'a.c': { $lt:4 } } ).sort( {'a.b':-1} ).itcount() );
if ( 0 ) { // SERVER-3005
assert.eq( 1, t.find( { a:{ b:3, c:6 }, 'a.c': { $lt:4 } } ).sort( {a:-1} ).itcount() );
}

assert.eq( [[{$maxElement:1},{$minElement:1}]], t.find( { 'a.b':{ $gt:2 }, 'a.c': { $lt:4 } } ).sort( {'a.b':-1} ).explain().indexBounds['a.c'] );
assert.eq( [[{$maxElement:1},{$minElement:1}]], t.find( { a:{ b:3, c:6 }, 'a.c': { $lt:4 } } ).sort( {a:-1} ).explain().indexBounds['a.c'] );

// Check second field is constrained if first is not.
assert.eq( 1, t.find( { 'a.c': { $lt:4 } } ).hint( {'a.b':1,'a.c':1} ).itcount() );
assert.eq( 1, t.find( { 'a.c': { $lt:4 } } ).hint( {a:1,'a.c':1} ).itcount() );

assert.eq( 4, t.find( { 'a.c': { $lt:4 } } ).hint( {'a.b':1,'a.c':1} ).explain().indexBounds['a.c'][0][1] );
assert.eq( 4, t.find( { 'a.c': { $lt:4 } } ).hint( {a:1,'a.c':1} ).explain().indexBounds['a.c'][0][1] );
