import * as React from 'react';

export const isReadyRef = React.createRef();
export const navigationRef = React.createRef();

export function navigate(name, params) {
  if (isReadyRef.current && navigationRef.current) {
    navigationRef.current.navigate(name, params);
  }
}

let pendingNavigation = null;

export function tryPendingNavigation() {
  if (pendingNavigation) {
    navigate(pendingNavigation.name, pendingNavigation.params);
    pendingNavigation = null;
  }
}

export function setPendingNavigation(name, params) {
  pendingNavigation = { name, params };
}
