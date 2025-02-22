/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { EuiGlobalToastList } from '@elastic/eui';
import { Toast } from '@elastic/eui/src/components/toast/global_toast_list';
import { EmptyTabParams, EventAnalyticsProps } from 'common/types/explorer';
import { isEmpty } from 'lodash';
import React, { createContext, ReactChild, useState } from 'react';
import { HashRouter, Route, RouteComponentProps, Switch, useHistory } from 'react-router-dom';
import { RAW_QUERY } from '../../../common/constants/explorer';
import '../../variables.scss';
import { LogExplorer } from './explorer/log_explorer';
import { Home as EventExplorerHome } from './home/home';

export const LogExplorerRouterContext = createContext<{
  routerProps: RouteComponentProps;
  searchParams: URLSearchParams;
} | null>(null);

export const EventAnalytics = ({
  chrome,
  parentBreadcrumbs,
  pplService,
  dslService,
  savedObjects,
  timestampUtils,
  http,
  notifications,
  queryManager,
  setBreadcrumbs,
  ...props
}: EventAnalyticsProps) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const eventAnalyticsBreadcrumb = {
    text: 'Logs',
    href: '#/',
  };

  const setToast = (title: string, color = 'success', text?: ReactChild, side?: string) => {
    if (!text) text = '';
    setToasts([...toasts, { id: new Date().toISOString(), title, text, color } as Toast]);
  };

  const getExistingEmptyTab = ({ tabIds, queries, explorerData }: EmptyTabParams) => {
    let emptyTabId = '';
    for (let i = 0; i < tabIds!.length; i++) {
      const tid = tabIds![i];
      if (isEmpty(queries[tid][RAW_QUERY]) && isEmpty(explorerData[tid])) {
        emptyTabId = tid;
        break;
      }
    }
    return emptyTabId;
  };

  return (
    <>
      <EuiGlobalToastList
        toasts={toasts}
        dismissToast={(removedToast) => {
          setToasts(toasts.filter((toast) => toast.id !== removedToast.id));
        }}
        toastLifeTimeMs={6000}
      />
      <HashRouter>
        <Switch>
          <Route
            path={['/explorer/:id', '/explorer']}
            render={(routerProps) => {
              setBreadcrumbs([
                ...parentBreadcrumbs,
                eventAnalyticsBreadcrumb,
                {
                  text: 'Explorer',
                  href: `#/explorer`,
                },
              ]);
              return (
                <LogExplorerRouterContext.Provider
                  value={{
                    routerProps,
                    searchParams: new URLSearchParams(routerProps.location.search),
                  }}
                >
                  <LogExplorer
                    savedObjectId={routerProps.match.params.id}
                    pplService={pplService}
                    dslService={dslService}
                    savedObjects={savedObjects}
                    timestampUtils={timestampUtils}
                    http={http}
                    setToast={setToast}
                    getExistingEmptyTab={getExistingEmptyTab}
                    notifications={notifications}
                    queryManager={queryManager}
                  />
                </LogExplorerRouterContext.Provider>
              );
            }}
          />
          <Route
            exact
            path={[`/`]}
            render={() => {
              setBreadcrumbs([
                ...parentBreadcrumbs,
                eventAnalyticsBreadcrumb,
                {
                  text: 'Home',
                  href: '#/',
                },
              ]);
              return (
                <EventExplorerHome
                  http={http}
                  savedObjects={savedObjects}
                  dslService={dslService}
                  pplService={pplService}
                  setToast={setToast}
                  getExistingEmptyTab={getExistingEmptyTab}
                />
              );
            }}
          />
        </Switch>
      </HashRouter>
    </>
  );
};
