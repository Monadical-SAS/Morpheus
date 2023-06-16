import React from "react";
import { MainMenu } from "../../packages/excalidraw/index";
import { LanguageList } from "./LanguageList";
import { SendImageTo } from "../../components/ImageSendImagine";

export const AppMainMenu: React.FC<{
  setCollabDialogShown: (toggle: boolean) => any;
  isCollaborating: boolean;
}> = React.memo((props) => {
  return (
    <MainMenu>
      <MainMenu.DefaultItems.LoadScene />
      <MainMenu.DefaultItems.SaveToActiveFile />
      <MainMenu.DefaultItems.Export />
      <MainMenu.DefaultItems.SaveAsImage />
      <MainMenu.DefaultItems.LiveCollaborationTrigger
        isCollaborating={props.isCollaborating}
        onSelect={() => props.setCollabDialogShown(true)}
      />

      <MainMenu.DefaultItems.Help />
      <MainMenu.DefaultItems.ClearCanvas />

      <MainMenu.Separator />
      <MainMenu.ItemCustom>
        <SendImageTo redirectPath={"img2img"} />
      </MainMenu.ItemCustom>
      <MainMenu.ItemCustom>
        <SendImageTo redirectPath={"controlnet"} />
      </MainMenu.ItemCustom>
      <MainMenu.ItemCustom>
        <SendImageTo redirectPath={"pix2pix"} />
      </MainMenu.ItemCustom>
      <MainMenu.ItemCustom>
        <SendImageTo redirectPath={"inpainting"} />
      </MainMenu.ItemCustom>

      <MainMenu.Separator />
      <MainMenu.DefaultItems.ToggleTheme />
      <MainMenu.ItemCustom>
        <LanguageList style={{ width: "100%" }} />
      </MainMenu.ItemCustom>
      <MainMenu.DefaultItems.ChangeCanvasBackground />
    </MainMenu>
  );
});
