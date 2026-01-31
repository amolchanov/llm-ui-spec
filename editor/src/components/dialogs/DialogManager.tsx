import { NewEntityDialog } from './NewEntityDialog';
import { NewPageDialog } from './NewPageDialog';
import { NewComponentDialog } from './NewComponentDialog';
import { NewLayoutDialog } from './NewLayoutDialog';
import { NewViewDialog } from './NewViewDialog';
import { NewAssetGroupDialog } from './NewAssetGroupDialog';
import { ElementPropertiesDialog } from './ElementPropertiesDialog';
import { SplitContainerDialog } from './SplitContainerDialog';
import { ViewMarkupDialog } from './ViewMarkupDialog';

export function DialogManager() {
  return (
    <>
      <NewEntityDialog />
      <NewPageDialog />
      <NewComponentDialog />
      <NewLayoutDialog />
      <NewViewDialog />
      <NewAssetGroupDialog />
      <ElementPropertiesDialog />
      <SplitContainerDialog />
      <ViewMarkupDialog />
    </>
  );
}
