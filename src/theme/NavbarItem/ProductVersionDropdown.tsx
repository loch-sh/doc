import type {ReactNode} from 'react';
import {useActivePlugin} from '@docusaurus/plugin-content-docs/client';
import DocsVersionDropdownNavbarItem from '@theme/NavbarItem/DocsVersionDropdownNavbarItem';
import type {Props as DropdownProps} from '@theme/NavbarItem/DocsVersionDropdownNavbarItem';

type Props = Omit<DropdownProps, 'docsPluginId'>;

// Each product is versioned on its own: show only the dropdown of the product being read.
export default function ProductVersionDropdown(props: Props): ReactNode {
  const activePlugin = useActivePlugin();
  if (!activePlugin) {
    return null;
  }
  // Custom items skip the config defaults of docsVersionDropdown: set them here.
  return (
    <DocsVersionDropdownNavbarItem
      dropdownItemsBefore={[]}
      dropdownItemsAfter={[]}
      {...props}
      docsPluginId={activePlugin.pluginId}
    />
  );
}
