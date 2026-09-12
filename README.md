# Tiptap Editor Setup
This is an rich text editor setup process for any next js project

1. Run this in the your project's root directory `npx @tiptap/cli init`
2. Then hit Enter and Choose yes for further decision
3. Select Full editor option
4. Then Select MIT licensed - Simple Editor
5. Further install these two packages `npm i @tiptap/extension-color @tiptap/extension-text-style @tiptap/extension-table`

### After Successful installation, follow the further steps to modify the editor more
##### Modify this path like the repo folder. There is setup for both cloudinary and vps image uploader
1. components\tiptap-templates\simple\data\content.json
2. components\tiptap-templates\simple\simple-editor.scss
3. components\tiptap-templates\simple\simple-editor.tsx
4. lib\tiptap-utils.ts

##### Add this path like the repo folder. There is setup for both cloudinary and vps image uploader
1. components\tiptap-templates\simple\simple-editor-preview.scss
2. components\tiptap-templates\simple\simple-editor-preview.tsx
3. components\tiptap-icons\type-color-icon.tsx
4. components\tiptap-ui\table-menu-bar\table-menu-bar.tsx
5. components\tiptap-ui\table-insert-button\table-insert-button.tsx
6. components\tiptap-ui\color-text-popover
7. components\tiptap-ui\color-text-button
