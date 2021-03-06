/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule getValidGraphQLTag
 * @flow
 * @format
 */

'use strict';

const GraphQL = require('graphql');

import type {DocumentNode} from 'graphql';

/**
 * Given a babel AST path to a tagged template literal, return an AST if it is
 * a graphql`` or graphql.experimental`` literal being used in a valid way.
 * If it is some other type of template literal then return nothing.
 */
function getValidGraphQLTag(path: any): ?DocumentNode {
  const tag = path.get('tag');

  const isGraphQLTag =
    tag.isIdentifier({name: 'graphql'}) ||
    tag.matchesPattern('graphql.experimental');

  if (!isGraphQLTag) {
    return;
  }

  const quasis = path.node.quasi.quasis;

  if (quasis.length !== 1) {
    throw new Error(
      'BabelPluginRelay: Substitutions are not allowed in graphql fragments. ' +
        'Included fragments should be referenced as `...MyModule_propName`.',
    );
  }

  const text = quasis[0].value.raw;

  const ast = GraphQL.parse(text);

  if (ast.definitions.length === 0) {
    throw new Error('BabelPluginRelay: Unexpected empty graphql tag.');
  }

  return ast;
}

module.exports = getValidGraphQLTag;
