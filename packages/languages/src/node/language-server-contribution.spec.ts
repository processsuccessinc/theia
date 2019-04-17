/********************************************************************************
 * Copyright (C) 2019 Ericsson and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { ProcessErrorEvent } from '@theia/process/lib/node';
import { BaseLanguageServerContribution } from './language-server-contribution';

/**
 * Typescript compiler should try to compile these files,
 * and it should fail if the types are not compatible.
 */

/**
 * Extension before: https://github.com/theia-ide/theia/commit/b8633c3fd5f08994c5d97b0e1d00e590b38c62d8
 */
// @ts-ignore
class Extension1 extends BaseLanguageServerContribution {

    protected onDidFailSpawnProcess(error: Error) {
        super.onDidFailSpawnProcess(error);
    }

}

/**
 * Extension as of https://github.com/theia-ide/theia/commit/b8633c3fd5f08994c5d97b0e1d00e590b38c62d8
 */
// @ts-ignore
class Extension2 extends BaseLanguageServerContribution {

    protected onDidFailSpawnProcess(error: ProcessErrorEvent) {
        super.onDidFailSpawnProcess(error);
    }

}
