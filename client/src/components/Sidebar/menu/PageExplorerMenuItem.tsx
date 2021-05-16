/* eslint-disable react/prop-types */

import React from 'react';

import Button from '../common/Button';
import Icon from '../common/Icon';
import { MenuItemProps } from './MenuItem';
import { LinkMenuItemDefinition } from './LinkMenuItem';
import { Provider } from 'react-redux';
import PageExplorer, { initPageExplorerStore } from '../../PageExplorer';
import { openPageExplorer, closePageExplorer } from '../../PageExplorer/actions';

export const PageExplorerMenuItem: React.FunctionComponent<MenuItemProps<PageExplorerMenuItemDefinition>> = (
  { path, item, state, dispatch, navigate }) => {
  const isOpen = state.navigationPath.startsWith(path);
  const isActive = isOpen || state.activePath.startsWith(path);
  const isInSubMenu = path.split('.').length > 2;
  const [isVisible, setIsVisible] = React.useState(false);

  const store = React.useRef<any>(null);
  if (!store.current) {
    store.current = initPageExplorerStore();
  }

  React.useEffect(() => {
    if (isOpen) {
      // isOpen is set at the moment the user clicks the menu item
      setIsVisible(true);

      if (store.current) {
        store.current.dispatch(openPageExplorer(item.startPageId));
      }
    } else if (!isOpen && isVisible) {
      // When a submenu is closed, we have to wait for the close animation
      // to finish before making it invisible
      setTimeout(() => {
        setIsVisible(false);
      }, 300);

      if (store.current) {
        store.current.dispatch(closePageExplorer());
      }
    }
  }, [isOpen]);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Open/close explorer
    if (isOpen) {
      dispatch({
        type: 'set-navigation-path',
        path: '',
      });
    } else {
      dispatch({
        type: 'set-navigation-path',
        path,
      });
    }
  };

  const className = (
    'sidebar-menu-item'
    + (isActive ? ' sidebar-menu-item--active' : '')
    + (isInSubMenu ? ' sidebar-menu-item--in-sub-menu' : '')
  );

  const sidebarTriggerIconClassName = (
    'sidebar-sub-menu-trigger-icon'
    + (isOpen ? ' sidebar-sub-menu-trigger-icon--open' : '')
  );

  return (
    <li className={className}>
      <Button dialogTrigger={true} onClick={onClick}>
        <Icon name="folder-open-inverse" className="icon--menuitem" />
        <span className="menuitem-label">{item.label}</span>
        <Icon className={sidebarTriggerIconClassName} name="arrow-right" />
      </Button>
      <div>
        {store.current &&
          <Provider store={store.current}>
            <PageExplorer navigate={navigate} />
          </Provider>
        }
      </div>
    </li>
  );
};

export class PageExplorerMenuItemDefinition extends LinkMenuItemDefinition {
  startPageId: number;

  constructor({ name, label, url, icon_name: iconName = null, classnames = undefined }, startPageId: number) {
    super({ name, label, url, icon_name: iconName, classnames });
    this.startPageId = startPageId;
  }

  render({ path, state, dispatch, navigate }) {
    return (
      <PageExplorerMenuItem
        key={this.name}
        item={this}
        path={path}
        state={state}
        dispatch={dispatch}
        navigate={navigate}
      />
    );
  }
}