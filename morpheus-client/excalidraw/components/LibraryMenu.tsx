import React, { useCallback, useState } from "react";
import Library, {
  distributeLibraryItemsOnSquareGrid,
  libraryItemsAtom,
} from "../data/library";
import { t } from "../i18n";
import { randomId } from "../random";
import {
  ExcalidrawProps,
  LibraryItem,
  LibraryItems,
  UIAppState,
} from "../types";
import LibraryMenuItems from "./LibraryMenuItems";
import { trackEvent } from "../analytics";
import { atom, useAtom } from "jotai";
import { jotaiScope } from "../jotai";
import Spinner from "./Spinner";
import {
  useApp,
  useAppProps,
  useExcalidrawElements,
  useExcalidrawSetAppState,
} from "./App";
import { getSelectedElements } from "../scene";
import { useUIAppState } from "../context/ui-appState";

import { LibraryMenuControlButtons } from "./LibraryMenuControlButtons";

export const isLibraryMenuOpenAtom = atom(false);

const LibraryMenuWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div className="layer-ui__library">{children}</div>;
};

export const LibraryMenuContent = ({
  onInsertLibraryItems,
  pendingElements,
  onAddToLibrary,
  setAppState,
  libraryReturnUrl,
  library,
  id,
  appState,
  selectedItems,
  onSelectItems,
}: {
  pendingElements: LibraryItem["elements"];
  onInsertLibraryItems: (libraryItems: LibraryItems) => void;
  onAddToLibrary: () => void;
  setAppState: React.Component<any, UIAppState>["setState"];
  libraryReturnUrl: ExcalidrawProps["libraryReturnUrl"];
  library: Library;
  id: string;
  appState: UIAppState;
  selectedItems: LibraryItem["id"][];
  onSelectItems: (id: LibraryItem["id"][]) => void;
}) => {
  const [libraryItemsData] = useAtom(libraryItemsAtom, jotaiScope);

  const addToLibrary = useCallback(
    async (elements: LibraryItem["elements"], libraryItems: LibraryItems) => {
      trackEvent("element", "addToLibrary", "ui");
      if (elements.some((element) => element.type === "image")) {
        return setAppState({
          errorMessage: "Support for adding images to the library coming soon!",
        });
      }
      const nextItems: LibraryItems = [
        {
          status: "unpublished",
          elements,
          id: randomId(),
          created: Date.now(),
        },
        ...libraryItems,
      ];
      onAddToLibrary();
      library.setLibrary(nextItems).catch(() => {
        setAppState({ errorMessage: t("alerts.errorAddingToLibrary") });
      });
    },
    [onAddToLibrary, library, setAppState]
  );

  if (
    libraryItemsData.status === "loading" &&
    !libraryItemsData.isInitialized
  ) {
    return (
      <LibraryMenuWrapper>
        <div className="layer-ui__library-message">
          <div>
            <Spinner size="2em" />
            <span>{t("labels.libraryLoadingMessage")}</span>
          </div>
        </div>
      </LibraryMenuWrapper>
    );
  }

  const showBtn =
    libraryItemsData.libraryItems.length > 0 || pendingElements.length > 0;

  return (
    <LibraryMenuWrapper>
      <LibraryMenuItems
        isLoading={libraryItemsData.status === "loading"}
        libraryItems={libraryItemsData.libraryItems}
        onAddToLibrary={(elements) =>
          addToLibrary(elements, libraryItemsData.libraryItems)
        }
        onInsertLibraryItems={onInsertLibraryItems}
        pendingElements={pendingElements}
        selectedItems={selectedItems}
        onSelectItems={onSelectItems}
        id={id}
        libraryReturnUrl={libraryReturnUrl}
        theme={appState.theme}
      />
      {showBtn && (
        <LibraryMenuControlButtons
          style={{ padding: "16px 12px 0 12px" }}
          id={id}
          libraryReturnUrl={libraryReturnUrl}
          theme={appState.theme}
          selectedItems={selectedItems}
          onSelectItems={onSelectItems}
        />
      )}
    </LibraryMenuWrapper>
  );
};

/**
 * This component is meant to be rendered inside <Sidebar.Tab/> inside our
 * <DefaultSidebar/> or host apps Sidebar components.
 */
export const LibraryMenu = () => {
  const { library, id, onInsertElements } = useApp();
  const appProps = useAppProps();
  const appState = useUIAppState();
  const setAppState = useExcalidrawSetAppState();
  const elements = useExcalidrawElements();

  const [selectedItems, setSelectedItems] = useState<LibraryItem["id"][]>([]);

  const deselectItems = useCallback(() => {
    setAppState({
      selectedElementIds: {},
      selectedGroupIds: {},
    });
  }, [setAppState]);

  return (
    <LibraryMenuContent
      pendingElements={getSelectedElements(elements, appState, true)}
      onInsertLibraryItems={(libraryItems) => {
        onInsertElements(distributeLibraryItemsOnSquareGrid(libraryItems));
      }}
      onAddToLibrary={deselectItems}
      setAppState={setAppState}
      libraryReturnUrl={appProps.libraryReturnUrl}
      library={library}
      id={id}
      appState={appState}
      selectedItems={selectedItems}
      onSelectItems={setSelectedItems}
    />
  );
};
