( function() {

    /**
     * The maximum number of quests you can have.
     * @type {Number}
     */
    game.MAX_QUESTS = 3;

    // There is only one QuestManager. It keeps track of which quests you have and will route certain events to the questions.
    window.game.QuestManager = {

        /**
         * The quest "slots" that this manages. This is initialized in the
         * 'initialize' function so that you can simply modify game.MAX_QUESTS
         * in the future if necessary.
         * @type {Object}
         */
        quests: {},

        /**
         * Initializes all quests to null.
         * @return {null}
         */
        initialize: function() {
            for (var i = 0; i < game.MAX_QUESTS; i++) {
                this.quests[i] = null;
            };
        },

        /**
         * @return {Boolean} false if you've already got game.MAX_QUESTS quests.
         */
        canAcceptQuests: function() {
            return this.getNextQuestSlotNumber() != null;
        },

        /**
         * @return {Number} - the first open quest slot.
         */
        getNextQuestSlotNumber: function() {
            for (var i = 0; i < game.MAX_QUESTS; i++) {
                if ( this.quests[i] == null ) return i;
            }

            return null;
        },

        /**
         * Gets the quest with this slot number.
         * @param  {Number} questSlotNumber - the number to find
         * @return {Quest}                 - the quest at that slot
         */
        getQuest: function(questSlotNumber) {
            return this.quests[questSlotNumber];
        },

        /**
         * Calls the function with the same name for each quest.
         * @return {null}
         */
        killedAnEnemyParty: function() {
            for (var i = 0; i < game.MAX_QUESTS; i++) {
                var quest = this.quests[i];
                if ( quest == null ) continue;

                quest.killedAnEnemyParty();
            };
        },

        /**
         * Calls the function with the same name for each quest.
         * @return {null}
         */
        collectedAnItem: function() {
            for (var i = 0; i < game.MAX_QUESTS; i++) {
                var quest = this.quests[i];
                if ( quest == null ) continue;

                quest.collectedAnItem();
            };
        },

        /**
         * Calls the function with the same name for each quest.
         * @return {null}
         */
        placedAUnit: function(unitType) {
            for (var i = 0; i < game.MAX_QUESTS; i++) {
                var quest = this.quests[i];
                if ( quest == null ) continue;

                quest.placedAUnit(unitType);
            };
        },

        /**
         * Quests call this when they gain progress (e.g. you killed an enemy
         * while you had a KILL_ENEMIES quest - that is progress). This checks
         * for completion and is also in charge of updating the UI.
         * @param  {Quest} quest - the quest that gained progress
         * @return {null}
         */
        questGainedProgress: function(quest) {
            var questSlotNumber = quest.questSlotNumber;
            if ( quest.isComplete() ) {
                this.quests[questSlotNumber] = null;

                // Randomly grant an item as a small reward
                game.Inventory.addItem(game.GenerateRandomItem());
            }

            game.QuestUI.updateQuest(questSlotNumber);
        },

        /**
         * This simply constructs a quest of a given type. It's like a factory.
         * It doesn't actually add the quest to the UI.
         * @param  {game.QuestType} questType           - the type of the quest
         * to construct
         * @param  {Number} nextQuestSlotNumber - the slot number of the quest
         * to construct
         * @return {Quest}                     - the Quest
         */
        constructQuest: function(questType, nextQuestSlotNumber) {
            var quest = null;
            switch( questType ) {
                case game.QuestType.KILL_ENEMIES:
                    quest = new game.KillEnemyPartyQuest(nextQuestSlotNumber);
                    break;
                case game.QuestType.COLLECT_ITEMS:
                    quest = new game.CollectItemQuest(nextQuestSlotNumber);
                    break;
                case game.QuestType.PLACE_WIZARDS: 
                    quest = new game.PlaceUnitQuest(nextQuestSlotNumber, game.PlaceableUnitType.WIZARD);
                    break;
                case game.QuestType.PLACE_ARCHERS: 
                    quest = new game.PlaceUnitQuest(nextQuestSlotNumber, game.PlaceableUnitType.ARCHER);
                    break;
                case game.QuestType.PLACE_WARRIORS: 
                    quest = new game.PlaceUnitQuest(nextQuestSlotNumber, game.PlaceableUnitType.WARRIOR);
                    break;
                case game.QuestType.COLLECT_ITEMS:
                    quest = new game.CollectItemQuest(nextQuestSlotNumber);
                    break;
                default:
                    console.log('Unrecognized quest type: ' + questType);
                    break;
            }
            return quest;
        },

        /**
         * Adds a new quest of the specified type to your list.
         * @param  {game.QuestType} questType - the type of quest you want. If
         * you don't provide this, a random quest will be chosen.
         * @return {null}
         */
        addNewQuest: function(questType) {
            if ( !this.canAcceptQuests() ) return;

            // If you don't pass in a type, randomly generate ANY quest.
            // This is debug code.
            if ( questType === undefined ) {
                var key = game.util.randomKeyFromDict(game.QuestType);
                questType = game.QuestType[key];
            }

            // Put this quest in the first available slot
            var nextQuestSlotNumber = this.getNextQuestSlotNumber();
            var quest = this.constructQuest(questType, nextQuestSlotNumber);
            this.quests[nextQuestSlotNumber] = quest;

            // Update the UI.
            game.QuestUI.updateQuest(quest.questSlotNumber);
        }

    };
}()); 