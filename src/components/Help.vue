<template>
    <div id="help-modal">
        <div id="help-container">
            <i class="material-icons" id="close-help" > close </i>
        </div>
    </div>
</template>

<script lang="ts">

export default ({
    setup() {
        return true;
    }
})
</script>

<style scoped lang="scss">
    #help-modal {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        background-color: rgba(0, 0, 0, 0.5);

        #help-container {
            position: absolute;
            height: 90vh;
            background-color: white;
            width: 90%;
            margin: auto;
            right: 0;
            left: 0;
            margin-top: 5vh;
            border-radius: 5px;
            box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.5);

            #close-help {
                transition: .3s;
                cursor: pointer;
                position: absolute;
                right: 15px;
                top: 15px;

                &:hover{
                    transition: .3s;
                    color: rgb(187, 0, 0);
                }
            }
        }
    }
</style>
