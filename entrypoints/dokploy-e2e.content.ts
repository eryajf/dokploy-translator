import { defineContentScript } from "wxt/utils/define-content-script";
import { startTranslator } from "../src/translation/dom-translator";

export default defineContentScript({
  matches: ["http://127.0.0.1:4173/*"],
  runAt: "document_idle",
  main() {
    startTranslator();
  },
});
