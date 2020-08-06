'use strict'
const fs = require( 'fs' )
const path = require( 'path' )
const appRoot = require( 'app-root-path' )
const autoload = require( 'auto-load' )
const values = require( 'lodash.values' )
const merge = require( 'lodash.merge' )
const debug = require( 'debug' )( 'speckle:modules' )
const { scalarResolvers, scalarSchemas } = require( './core/graph/scalars' )

exports.init = async ( app ) => {
  let dirs = fs.readdirSync( `${appRoot}/modules` )
  let moduleDirs = [ ]

  await require( './core' ).init( app )

  dirs.forEach( file => {
    let fullPath = path.join( `${appRoot}/modules`, file )

    if ( fs.statSync( fullPath ).isDirectory( ) && file !== 'core' && file !== 'shared' ) {
      moduleDirs.push( fullPath )
    }
  } )

  // Other modules preflight
  moduleDirs.forEach( async dir => {
    await require( dir ).init( app )
  } )
}

exports.graph = ( ) => {
  let dirs = fs.readdirSync( `${appRoot}/modules` )
  // Base query and mutation to allow for type extension by modules.
  let typeDefs = [ `
      ${scalarSchemas}

      type Query {
      """
      Stare into the void.
      """
        _: String
      }
      type Mutation{
      """
      The void stares back.
      """
      _: String
      }
      type Subscription{
        """
        It's lonely in the void.
        """
        _: String
      }` ]

  let resolverObjs = [ ]
  // let directiveDirs = [ ]

  dirs.forEach( file => {
    let fullPath = path.join( `${appRoot}/modules`, file )

    // load and merge the type defintions
    if ( fs.existsSync( path.join( fullPath, 'graph', 'schemas' ) ) ) {
      let moduleSchemas = fs.readdirSync( path.join( fullPath, 'graph', 'schemas' ) )
      moduleSchemas.forEach( schema => {
        typeDefs.push( fs.readFileSync( path.join( fullPath, 'graph', 'schemas', schema ), 'utf8' ) )
      } )
    }

    // first pass load of resolvers
    if ( fs.existsSync( path.join( fullPath, 'graph', 'resolvers' ) ) ) {
      resolverObjs = [ ...resolverObjs, ...values( autoload( path.join( fullPath, 'graph', 'resolvers' ) ) ) ]
    }
  } )

  let resolvers = { ...scalarResolvers }
  resolverObjs.forEach( o => {
    merge( resolvers, o )
  } )

  return { resolvers, typeDefs }
}
