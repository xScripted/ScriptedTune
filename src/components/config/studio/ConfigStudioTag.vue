<template>
  <div id="TagCreator">


    <div id="new-tag">

      <div class="new-tag-title"> 
        <h5> New Tag </h5>
        <div class="tag-preview">
          <div class="tag" :style="{ backgroundColor: newTag.bgColor.value, color: newTag.textColor.value }"> 
            {{ newTag.emoji.value + ' ' + newTag.name.value }}
          </div>
        </div>
      </div>

      <div class="tag-input-name">
        <div class="label">Tag Name </div>
        <input type="text" @input="newTag.name.value = $event.target.value">
      </div>

      <div class="select-tag-bg-color">
        <div class="label"> Background </div>
        <input type="color" :value="newTag.bgColor.value" @input="newTag.bgColor.value = $event.target.value"> 
      </div>

      <div class="select-tag-text-color">
        <div class="label"> Text </div>
        <input  type="color" :value="newTag.textColor.value" @input="newTag.textColor.value = $event.target.value"> 
      </div>

      <div class="emoji-tag">
        <div class="label"> Emoji </div>
        <div class="waves-effect waves-light btn blue lighten-5" @click="pickerEvent($event.target, 'new-tag')"> {{ newTag.emoji.value }} </div>
      </div>

      <div class="add-tag">
        <div class="label"> Add Tag </div>
        <button class=" waves-effect waves-light btn blue lighten-5" @click="addTag"> 
          <i class="material-icons">call_made</i>
        </button>
      </div>

    </div>

    <div id="tag-list">
      <div class="tag-item tag" v-for="tag in tags" :key="tag.id" @click="clickTagToEdit(tag)"
          :style="{ backgroundColor: tag.bgColor, color: tag.textColor }"> 
        {{ tag.emoji + ' ' + tag.name }}
      </div>
    </div>

    <div id="edit-tag-list">

      <div class="edit-tag-preview">
        <div class="tag" :style="{ backgroundColor: editTag.bgColor.value, color: editTag.textColor.value }"> 
          {{ editTag.emoji.value + ' ' + editTag.name.value }}
        </div>
      </div>

      <div class="edit-tag-name">
        <input type="text" :value="editTag.name.value" @input="editTag.name.value = $event.target.value">
      </div>

      <div class="edit-tag-emoji">
        <div class="waves-effect waves-light btn blue lighten-5" @click="pickerEvent($event.target, 'edit-tag')"> {{ editTag.emoji.value }} </div>
      </div>

      <div class="edit-tag-bg-color">
        <input type="color" :value="editTag.bgColor.value" @input="editTag.bgColor.value = $event.target.value">
      </div>

      <div class="edit-tag-text-color">
        <input type="color" :value="editTag.textColor.value" @input="editTag.textColor.value = $event.target.value">
      </div>

      <div class="edit-tag-remove waves-effect waves-light btn red lighten-3" @click="deleteTag">
        <i class="material-icons"> close </i> Delete
      </div>

      <div class="edit-tag-update waves-effect waves-light btn blue lighten-5" @click="updateTag">
        <i class="material-icons"> mode_edit </i> Update
      </div>
    </div>
  </div>  
</template>

<script lang="ts">

import { inject, ref } from 'vue';
import { EmojiButton } from '@joeattardi/emoji-button';
import { Tag } from '@/models/Tag';
import store from '@/store/store';
import { ipcRenderer } from 'electron';

export default ({
  setup() {

    const picker = new EmojiButton();
    var pickerType = 'new-tag';

    const titleStudio = 'TMP';

    const tags = store.getters.tagList;
    const createuuid: any = inject('createuuid');
    const newTag = {
      name: ref(''),
      bgColor: ref('#EEEEEE'),
      textColor: ref('#000000'),
      emoji: ref('')
    };

    const editTag = {
      id: ref(''),
      name: ref(''),
      bgColor: ref('#EEEEEE'),
      textColor: ref('#000000'),
      emoji: ref('')
    }


    function pickerEvent(target: any, type: string) {
      picker.togglePicker(target);
      pickerType = type;
    }

    picker.on('emoji', selection => {
      if(pickerType == 'new-tag') newTag.emoji.value = selection.emoji;
      if(pickerType == 'edit-tag') editTag.emoji.value = selection.emoji;
    });

    function addTag() {

      const tag: Tag = {
        id: 'tag-' + createuuid(),
        name: newTag.name.value,
        bgColor: newTag.bgColor.value,
        textColor: newTag.textColor.value,
        type: false,
        emoji: newTag.emoji.value,
        date: new Date(),
        isTag: true,
      }

      store.actions.setTagList([tag], true);
      ipcRenderer.send('reloadData');
    }

    function clickTagToEdit(tag: Tag) {
      editTag.id.value = tag.id;
      editTag.name.value = tag.name;
      editTag.bgColor.value = tag.bgColor;
      editTag.textColor.value = tag.textColor;
      editTag.emoji.value = tag.emoji;
    }

    function updateTag() {
      if(editTag.id.value != '') {
        store.actions.updateTag(editTag);
        ipcRenderer.send('reloadData');
      }
    }

    function deleteTag() {
      store.actions.removeTag(editTag.id.value);
      ipcRenderer.send('reloadData');

      editTag.id.value = '';
      editTag.name.value = '';
      editTag.bgColor.value = '';
      editTag.textColor.value = '';
      editTag.emoji.value = '';
    }


    return {
      titleStudio, picker, addTag, newTag, tags, clickTagToEdit, editTag, updateTag, pickerEvent, deleteTag
    }
  }
});
</script>

<style scoped lang="scss">

 #TagCreator {
   display: grid;
   grid-template-columns: 3fr 2fr;
   grid-template-rows: 2fr 3fr;

  #new-tag {
    grid-column: 1 / 4;

    display: grid;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 15fr 5fr 5fr 5fr 2fr; 
    width: 100%;
    column-gap: 20px;
    justify-items: left;
    align-items: left;

    .new-tag-title{
      grid-column: 1 / 6;
      display: flex;
      align-items: center;

      .tag-preview {
        padding-left: 20px;
      }

    }

    .tag-input-name {
      width: 100%;
      text-align: left;
    }

    .select-tag-text-color, .select-tag-bg-color, .emoji-tag, .add-tag {
      height: 100%;
      width: 100%;
      text-align: left;

      .label {
        width: 100%;
        margin-bottom: 15px;
      }

      input {
        width: 100%;
      }
    }

    .add-tag {
      button {
        color: black;
      }
    }
  }

  #tag-list {
    padding: 20px;
    .tag-item{
      transition: .3s;
      float: left;
      margin: 5px;

      &:hover {
        transition: .3s;
        box-shadow: 0px 0px 1px 1px #000;     
      }
    }
  }

  #edit-tag-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 20px;
    border-left:1px solid lightgray;

    .edit-tag-preview{
      grid-column: 1 / 3;
    }

    .edit-tag-update, .edit-tag-remove {
      margin: 20px;
      display: flex;
      justify-content: center;
      color: black;

      i {
        margin-right: 10px;
      }
    }
  }

 }

</style>