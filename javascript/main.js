var savedCards = [1, 2, 2]; //[divination, enchantment, necromancy]
var coins = 0;
var scenarioOver = false;
var adventures = 0;
var wandBought = false;
var elixorBought = false;
var hatBought = false;

//Music by GioeleFazzeri from Pixabay
//Music by DSTechnician from Pixabay

var Battle = new Phaser.Class({
	Extends: Phaser.Scene,
	
	initialize:
		function battle(){
			Phaser.Scene.call(this, {key: 'battle'});
		},
		
	preload: function (){
		this.load.image("battleground","assets/Battle BG.png");
		this.load.image("play", "assets/Play.png");
		
		this.load.image("divi","assets/Divination.png");
		this.load.image("enchant", "assets/Enchantment.png");
		this.load.image("necro", "assets/Necromancy.png");
		
		this.load.audio('music', "assets/Battle Theme.mp3");
		this.load.audio('button', "assets/buttonClick.mp3")
	},
		
	create: function (){
		buttonSound = this.sound.add("button");
		button.volume= 0.5;
		music = this.sound.add('music');
		music.volume = 0.2;
		music.play();
		
		var scenario = {
			keyType: "",
			text: "",
			cost: 3,
		}
		
		background = this.add.image(0, 0, "battleground").setOrigin(0);
		let play = this.add.image(400, 300, "play");
		
		var inPlay = [];
		var cards = this.physics.add.group();
		
		
		let typeDecider = Phaser.Math.Between(0,2);
		switch(typeDecider){
			case 0:
				scenario.keyType = "divination";
				break;
			case 1:
				scenario.keyType = "enchantment";
				break;
			case 2:
				scenario.keyType = "necromancy";
				break;
			default:
				console.log("Error: something went wrong, between went above 2");
				break;
		}
		
		lowLimit = Math.floor(adventures / 5) + 2;
		highLimit = Math.floor(adventures / 5) + 5;
		let costDecider = Phaser.Math.Between(lowLimit, highLimit);
		scenario.cost = costDecider;
		
		let scenarioText = scenario.keyType + " is worth x3"
		this.topText = this.add.text(225, 100, scenarioText, {font: "36px Papyrus", fill: "#000"});

		
		divCard = savedCards[0];
		enchCard = savedCards[1];
		necroCard = savedCards[2];
		
		play.setScale(0.6)
    	background.setDisplaySize(800, 600);
    	
    	
    	let cardNum = divCard + enchCard + necroCard;
    	if(divCard > 0 || enchCard > 0 || necroCard > 0){	
			for(let i = 0; i < divCard; i++){
				card = cards.create(100 + (cardNum * 55), 525, "divi")
				card.setInteractive();
				card.setScale(0.4);
				card.value = "divination";
		    	this.input.setDraggable(card);
				card.setCollideWorldBounds(true);
		    	cardNum--;
			}
			for(let j = 0; j < enchCard; j++){
				card = cards.create(100 + (cardNum * 55), 525 , "enchant")
				card.setInteractive();
				card.setScale(0.4);
				card.value = "enchantment";
				this.input.setDraggable(card);
				card.setCollideWorldBounds(true);
				cardNum--;
			}
			for(let k = 0; k < necroCard; k++){
				card = cards.create(100 + (cardNum * 55), 525, "necro")
				card.setInteractive();
				card.setScale(0.4);
				card.value = "necromancy"
				this.input.setDraggable(card);
				card.setCollideWorldBounds(true);
				cardNum--;
			}
		}
		
		this.input.dragDistanceThreshold = 16;
		
		
		let cardDraw = 0;
		function playCard(spell){
			button.play();
			spell.setX(400);
			spell.setY(300);
			spell.setScale(0.6);
			spell.disableInteractive();
			inPlay.push(spell);
			switch(spell.value){
				case "divination":
					savedCards[0]--;
					break;
				case "enchantment":
					savedCards[1]--;
					break;
				case "necromancy":
					savedCards[2]--;
					break;
				default:
					console.log("Error: Unknown card value");
					break;
			}
			if(spell.value == "divination" && !wandBought){
				cardDraw++;
			}
			else if(spell.value == "divination" && wandBought){
				cardDraw+= 2;
			}
			// play animation
			let win = calculate(inPlay);
			cardTotal = savedCards[0] + savedCards[1] + savedCards[2];
			if(cardTotal === 0)
				loseScreen();
			else if(win){
				winScreen();
			}
			
		};
		
		this.input.on('gameobjectdown', function(pointer, cards){
			if(cards.value)
				playCard(cards);
		});
	    
	    let costText = this.add.text(500, 250, "Cost: " + scenario.cost, {font: "36px Papyrus", fill: "#000"})
	    
		function calculate(inPlay){
			//Step 1, check scenario requirements
			let limit = scenario;
			//Step 2, check value of cards in play
			let typeArr = [];
			for(i = 0; i < inPlay.length; i++){
				typeArr.push(inPlay[i].value);
			};
			//step 3, does this pass the threshold?
			let pass = false;
			//	if yes, remove the cards and give a win screen
			let power = 0;
			
			if(elixorBought){
				for(i = 0; i < typeArr.length; i++){
					if(typeArr[i] == limit.keyType){
						power+= 6;
					}
					else{
						power+= 2;
					}
				}	
			}
			else{
				for(i = 0; i < typeArr.length; i++){
					if(typeArr[i] == limit.keyType){
						power += 3;
					}
					else{
						power++;
					}
				}
			}
			if(limit.cost - power < 0){
				costText.setText("Cost: 0");
			}
			else{
				costText.setText("Cost: " + (limit.cost - power));	
			}
			
			if(power >= limit.cost){
				pass = true;
			}
			else{
				pass = false;
			}
			return pass;
		}
		
		let winText = this.add.text(275, 250, "", {font: "60px Lucida Handwriting", fill:"#DDD"});
		let nextButton = this.add.text(600, 550, "", {font: "45px", fill:"#A00"});
		let continueButton = this.add.text(600, 550, "", {font: "45px", fill:"#A00"});
		continueButton.setInteractive();
		
		function winScreen(){
			background.setTint(0x99AA99);
			play.setTint(0x99AA99);
			cards.setTint(0x99AA99);
			for(let i = 0; i < inPlay.length; i++){
				inPlay[i].disableInteractive();
			}
			cards.destroy(true, true);
			winText.setText("Success!");
			nextButton.setText("Next");
			nextButton.setInteractive();
			nextButton.on('pointerdown', drawCard);
			cardDraw++;
			numCards = savedCards[0] + savedCards[1] + savedCards[2];
			coins += numCards * 3;
			scenarioOver = true;
			adventures++;
		};
		
		function loseScreen(){
			coins = 0;
			background.setTint(0x99AA99);
			play.setTint(0x99AA99);
			cards.setTint(0x99AA99);
			for(let i = 0; i < inPlay.length; i++){
				inPlay[i].disableInteractive();
			}
			cards.destroy(true, true);
			winText.setText("You Lose!");
			continueButton.setText("Next");
			continueButton.setInteractive();
			scenarioOver = true;
			savedCards[0] = 1;
			savedCards[1] = 2;
			savedCards[2] = 2;
			wandBought = false;
			elixorBought = false;
			hatBought = false;
			adventures = 0;
		};
		
		continueButton.on('pointerdown', function(){
			button.play();
			this.scene.start('shop');
			music.stop();
		}, this)
		
		let drawText = this.add.text(150, 250, "", {font: "35px Lucida Handwriting", fill:"#DDD"})
		
		function drawCard(){
			let cardType = "";
			let cardTotal = savedCards[0] + savedCards[1] + savedCards[2];
			let profit = (cardTotal) * 3;
			for(let i = 0; i < cardDraw; i++){
				let val = Phaser.Math.Between(0,2);
				cardTotal = savedCards[0] + savedCards[1] + savedCards[2];
				handLimit = 10;
				if(hatBought)
					handLimit = 12;
				if(handLimit - cardTotal > 0){
					switch(val){
					case 0:
						cardType += "divination\n";
						savedCards[0]++;
						break;
					case 1:
						cardType += "enchantment\n";
						savedCards[1]++;
						break;
					case 2:
						cardType += "necromancy\n";
						savedCards[2]++;
						break;
					default:
						console.log("Something went wrong, number greater than 2");
						break;
					}	
				}
				
			}
			nextButton.setText("");
			continueButton.setText("Next");
			winText.setText("");
			drawText.setText(`You got: \n ${cardType} and you earned ${profit} coins`)
			nextButton.off('pointerdown', drawCard);
		}
		
	},
	
	update: function(){
	}

		
		
});

var Shop = new Phaser.Class({
	Extends: Phaser.Scene,
	
	initialize: 
	function shop(){
		Phaser.Scene.call(this, {key: 'shop'});
	},
	
	preload: function(){
		this.load.audio('theme', "assets/Menu Theme.mp3")
		this.load.audio('button', "assets/buttonClick.mp3")
		
		this.load.image('wand', "assets/Wand of Future Sight.png");
		this.load.image('elixor', "assets/Elixor of Double Play.png");
		this.load.image('hat', "assets/Hat of Knowledge.png");
		
		this.load.image('star', "assets/star.png");
		
		this.load.image("shop", "assets/Shop Menu Screen.png");
		this.load.image("back", "assets/Back Button.png");
		this.load.image("price","assets/Cash card.png");
		this.load.image("adventure", "assets/Adventure.png");
		this.load.image("lunchsign", "assets/Out for Lunch.png");
		
		this.load.image("divi","assets/Divination.png");
		this.load.image("enchant", "assets/Enchantment.png");
		this.load.image("necro", "assets/Necromancy.png");
	},
	
	create: function(){
		buttonSound = this.sound.add("button");
		button.volume= 0.5;
		let music = this.sound.add('theme');
		music.volume = 0.2;
		music.play();
		
		background = this.add.image(0,0, "shop").setOrigin(0);
		background.setDisplaySize(800, 600);
		
		lunchsign = this.add.image(125, 330, "lunchsign");
		lunchsign.setScale(2.5);
		
		wand = this.add.image(335, 170, "wand");
		wand.setScale(2.5);
		wandPrice = this.add.image(415, 175, "price")
		wandPrice.setScale(2);
		wandPriceText = this.add.text(400, 165, "150", {font: "15px Impact", fill:"#000"});
		if(!wandBought)
			wand.setInteractive();
		else
			wand.setTint(0x696969);
		wand.on('pointerdown', function(){
			if(coins >= 150){
				button.play();
				wand.disableInteractive();
				wand.setTint(0x696969);
				coins -= 150;
				coinText.setText(`Coins: ${coins}`);
				wandBought = true;
			}
		});
		
		elixor = this.add.image(500, 164, "elixor");
		elixor.setScale(2.5);
		elixorPrice = this.add.image(560, 175, "price")
		elixorPrice.setScale(2);
		elixorPriceText = this.add.text(543, 165, "450", {font: "15px Impact", fill:"#000"});
		if(!elixorBought)
			elixor.setInteractive();
		else
			elixor.setTint(0x696969);
		elixor.on('pointerdown', function(){
			if(coins >= 300){
				button.play();	
				elixor.disableInteractive();
				elixor.setTint(0x696969);
				coins -= 450;
				coinText.setText(`Coins: ${coins}`);
				elixorBought = true;
			}
		});
		
		
		hat = this.add.image(670, 162, "hat");
		hat.setScale(2.5);
		hatPrice = this.add.image(750, 175, "price")
		hatPrice.setScale(2);
		hatPriceText = this.add.text(733, 165, "700", {font: "15px Impact", fill:"#000"});
		hat.setInteractive();
		if(!hatBought)
			hat.setInteractive();
		else
			hat.setTint(0x696969);
		hat.on('pointerdown', function(){
			if(coins >= 700){
				button.play();
				hat.disableInteractive();
				hat.setTint(0x696969);
				coins -= 700;
				coinText.setText(`Coins: ${coins}`);
				hatBought = true;
			}
		});
		
		
		let currentCards = ` Current Cards\n\nDivination: ${savedCards[0]} \n\nEnchantment: ${savedCards[1]} \n\nNecromancy: ${savedCards[2]} \n`;
		
		displayCards = this.add.text(50, 420, currentCards, {font: '20px Verdana'});
		
		let adventuresTaken = `Adventures Without\n       Disaster: ${adventures}`
		
		displayAdventures = this.add.text(640, 265, adventuresTaken, {font: '15px Verdana'});
		
		star1 = this.add.image(660, 325, "star");
		star2 = this.add.image(710, 325, "star");
		star3 = this.add.image(760, 325, "star");
		star1.setVisible(false);
		star2.setVisible(false);
		star3.setVisible(false);
		
		if(adventures >= 10){
			star1.setVisible(true);
		}
		if(adventures >= 50){
			star2.setVisible(true);
		}
		if(adventures >= 100){
			star3.setVisible(true);
		}
		
		adventure = this.add.image(550, 280, "adventure");
		adventure.setScale(2.5);
		adventure.setInteractive();
		adventure.on('pointerdown', adventureTime, this)
		function adventureTime(){
			button.play();
			this.scene.start('battle');
			music.stop();
			//console.log("Adventure");
		}
		
		
		
		coinText = this.add.text(310, 265, "Coins : " + coins, {font: "25px Lucida Handwriting"});
		
		back = this.add.image(25, 25, "back");
		back.setScale(1.5);
		back.setInteractive();
		back.on('pointerdown', mainMenu, this);
		function mainMenu(){
			button.play();
			this.scene.start('mainmenu');
			music.stop();
		}
		
		card1 = this.add.image(325, 60, "divi");
		card1.setScale(0.25);
		price1 = this.add.image(380, 80, "price");
		price1.setScale(2);
		priceText1 = this.add.text(370, 70, "15",{font: "15px Impact", fill:"#000"});
		
		let total = savedCards[0] + savedCards[1] + savedCards[2];
		handLimit = 10;
		if(hatBought)
			handLimit = 12;
		
		card1.setInteractive();
		card1.on('pointerdown', function(){
			if(coins >= 15){
				if(total < handLimit){
				button.play();
				savedCards[0]++;
				total = savedCards[0] + savedCards[1] + savedCards[2];
				displayCards.setText(` Current Cards\n\nDivination: ${savedCards[0]} \n\nEnchantment: ${savedCards[1]} \n\nNecromancy: ${savedCards[2]} \n`);
				coins-= 15;
				coinText.setText("Coins: " + coins);
				}
			}
		});
		
		card2 = this.add.image(500, 60, "enchant");
		card2.setScale(0.25);
		price2 = this.add.image(555, 80, "price");
		price2.setScale(2);
		priceText2 = this.add.text(550, 70, "5",{font: "15px Impact", fill:"#000"});
		
		card2.setInteractive();
		card2.on('pointerdown', function(){
			if(coins >= 5){
				if(total < handLimit){
				button.play();
				savedCards[1]++;
				total = savedCards[0] + savedCards[1] + savedCards[2];
				displayCards.setText(` Current Cards\n\nDivination: ${savedCards[0]} \n\nEnchantment: ${savedCards[1]} \n\nNecromancy: ${savedCards[2]} \n`);
				coins-= 5;
				coinText.setText("Coins: " + coins);
				}
			}
		});
		
		
		card3 = this.add.image(675, 60, "necro");
		card3.setScale(0.25);
		price3 = this.add.image(730, 80, "price");
		price3.setScale(2);
		priceText2 = this.add.text(720, 70, "10",{font: "15px Impact", fill:"#000"});
		
		card3.setInteractive();
		card3.on('pointerdown', function(){
			if(coins >= 10){
				if(total < handLimit){
				button.play();
				savedCards[2]++;
				total = savedCards[0] + savedCards[1] + savedCards[2];
				displayCards.setText(` Current Cards\n\nDivination: ${savedCards[0]} \n\nEnchantment: ${savedCards[1]} \n\nNecromancy: ${savedCards[2]} \n`);
				coins -= 10;
				coinText.setText("Coins: " + coins);
				}
			}
		});
		
		
		/*
		upgrade1;
		upgrade2;
		upgrade3;*/
	},
	
	update: function(){
		
	}

});

var MainMenu = new Phaser.Class({
	Extends: Phaser.Scene,
	
	
	initialize:
	function main(){
		Phaser.Scene.call(this, {key: 'mainmenu'});
	},
	
	preload: function(){
		this.load.audio('menuTheme', "assets/Town Theme.mp3")
		this.load.audio('button', "assets/buttonClick.mp3")
		
		this.load.image("mainmenu", "assets/Menu.png");
		this.load.image("start", "assets/Starts.png");
		this.load.image("help", "assets/Help.png");
		this.load.image("back", "assets/Back Button.png");
		
		this.load.image('wand', "assets/Wand of Future Sight.png");
		this.load.image('elixor', "assets/Elixor of Double Play.png");
		this.load.image('hat', "assets/Hat of Knowledge.png");
		
		this.load.image("div", "assets/Divination.png");
		this.load.image("ench", "assets/Enchantment.png");
		this.load.image("necro", "assets/Necromancy.png");
	},
	
	create: function(){
		button = this.sound.add("button");
		button.volume= 0.5;
		
		menuMusic = this.sound.add('menuTheme');
		menuMusic.volume = 0.2;
		menuMusic.play();
		
		mainMenu = this.add.image(0,0, "mainmenu").setOrigin(0);
		mainMenu.setDisplaySize(800, 600);
		
		backButton = this.add.image(740, 60, "back");
		backButton.setScale(2.5);
		backButton.setVisible(false);
		backButton.setInteractive();

		startButton = this.add.image(400, 230, "start");
		startButton.setScale(0.8);
		startButton.setInteractive();
		startButton.on('pointerdown', function(){
			button.play();
			this.scene.start('shop');
			menuMusic.stop();
		}, this);
		
		wand = this.add.image(130, 570, "wand");
		wand.setScale(2);
		wandText = this.add.text(15, 490, "                Wand of Sight:         \nDivination draws an extra card", {font: '18px Papyrus'});
		wand.setVisible(false);
		wandText.setVisible(false);
		
		elixor = this.add.image(380, 570, "elixor");
		elixor.setScale(2);
		elixorText = this.add.text(280, 490, "      Elixor of DoubleCast:      \nThe values of cards are doubled", {font: '16px Papyrus'});
		elixor.setVisible(false);
		elixorText.setVisible(false);
		
		hat = this.add.image(650, 570, "hat");
		hat.setScale(2);
		hatText = this.add.text(530, 485, "         Hat of Knowledge:    \nThe hand size increases by 2", {font: '18px Papyrus'});
		hat.setVisible(false);
		hatText.setVisible(false);
		
		let title = "Welcome to Spell Slinger";
		let text1 = "There are 3 types of spell cards: Divination, Enchantment, and Necromancy"
		let goal = "The goal of the game is to leave an adventure with at least 1 spell remaining";
		let restraints = "You can buy spells and upgrades in the shop, but beware:\n         you cannot carry more than 10 spells at a time!"
		
		let titleText = this.add.text(155, 25, title, {font: '45px Papyrus'});
		titleText.setVisible(false);
		
		let text1Text = this.add.text(60, 150, text1, {font: '22px Papyrus'});
		text1Text.setVisible(false);
		
		let goalText = this.add.text(60, 275, goal, {font: '22px Papyrus'});
		goalText.setVisible(false);
		
		let restraintsText = this.add.text(40, 400, restraints, {font: '30px Papyrus'});
		restraintsText.setVisible(false);
		
		div = this.add.image(420, 220, "div");
		div.setScale(0.3);
		ench = this.add.image(540, 220, "ench");
		ench.setScale(0.3);
		necro = this.add.image(710, 220, "necro");
		necro.setScale(0.3);
		div.setVisible(false);
		ench.setVisible(false);
		necro.setVisible(false);
		
		
		helpButton = this.add.image(415, 355, "help");
		helpButton.setScale(0.85);
		helpButton.setInteractive()
		helpButton.on('pointerdown', function(){
			button.play();
			mainMenu.setTint(0x696969);
			startButton.setTint(0x696969);
			helpButton.setTint(0x696969);
			backButton.setVisible(true);
			titleText.setVisible(true);
			text1Text.setVisible(true);
			goalText.setVisible(true);
			div.setVisible(true);
			ench.setVisible(true);
			necro.setVisible(true);
			wand.setVisible(true);
			wandText.setVisible(true);
			elixor.setVisible(true);
			elixorText.setVisible(true);
			hat.setVisible(true);
			hatText.setVisible(true);
			restraintsText.setVisible(true);
			backButton.on('pointerdown', reset);
		});
		
		function reset(){
			button.play();
			backButton.off('pointerdown');
			backButton.setVisible(false);
			titleText.setVisible(false);
			text1Text.setVisible(false);
			goalText.setVisible(false);
			restraintsText.setVisible(false);
			div.setVisible(false);
			ench.setVisible(false);
			necro.setVisible(false);
			wand.setVisible(false);
			wandText.setVisible(false)
			elixor.setVisible(false);
			elixorText.setVisible(false)
			hat.setVisible(false);
			hatText.setVisible(false);
			mainMenu.clearTint();
			startButton.clearTint();
			helpButton.clearTint();
		}
	},
	
	update: function(){
		
	}
});

    
var config = {
	type: Phaser.WEBGL,	
    scale: {
		mode: Phaser.Scale.FIT,
		parent: 'full-game',
		width: 800,
       	height: 600,
	},
    scene: [	 MainMenu, Shop, Battle,	],
    physics: {
		default: 'arcade',
		arcade: {
			debug: false,
		}	
	},
};
	
	
var game = new Phaser.Game(config);
	
