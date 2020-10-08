var ZOOM_LEVEL = 4;

var config = {
    type: Phaser.AUTO,
    parent: 'canvas',
	pixelArt: true,
	scale: {
        mode: Phaser.Scale.RESIZE
    },
	physics: {
        default: 'arcade',
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var player;
var graphics;
var cursors;
var text;
var music;
var moved = false;
var runned = false;
var slided = false;
var moveCam = false;
var camera;

var bounds = [0,0,0,0];
var camXBound = 379;

var gameTick = 0;

var game = new Phaser.Game(config);

function preload ()
{
    this.load.image('bg', 'http://192.168.161.1:8080/cthigh.png');
	this.load.atlas('alex', 'http://192.168.161.1:8080/alex.png', 'http://192.168.161.1:8080/alex.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
	this.load.audio('walk', 'http://192.168.161.1:8080/walk.ogg');
	this.load.bitmapFont('rcr', 'http://192.168.161.1:8080/rcrfontfinal.png', 'http://192.168.161.1:8080/rcrfontfinal.xml');
}

function create ()
{
	resizeCanvas();
	
	var queryParams = getQueryParams(document.location.search);
	
    bounds = [0, 105, 764, 167];

    this.add.image(0, 24, 'bg').setOrigin(0);

    cursors = this.input.keyboard.createCursorKeys();

    player = this.physics.add.sprite(38, 125, 'alex', 'sprite1');

	this.physics.world.setFPS(30);

	player.movingFrame = 0;
	player.sprites = "";
	player.xMove = "";
	player.yMove = "";
	player.lastLeft = 0;
	player.lastRight = 0;

    //this.cameras.main.startFollow(player, true);
	
	this.sound.pauseOnBlur = false;

    text = this.add.bitmapText(8, 32, 'rcr').setScrollFactor(0);
	
	text2 = this.add.bitmapText(16, 8, 'rcr','ALEX [[[]').setScrollFactor(0);
	
	text3 = this.add.bitmapText(40, 192, 'rcr','* Cross Town High *').setScrollFactor(0).setOrigin(0.5);
	text4 = this.add.bitmapText(8, 208, 'rcr','The BETA TESTERS\' turf!').setScrollFactor(0).setOrigin(0.5);
	
	if (queryParams.m != "debug" ) {
		text.setVisible(false);
	}
	
	music = this.sound.add('walk');

	music.setLoop(true);
	music.play();

    //music.play();
}

function update(time, delta) {

    this.frameTime += delta;

    if (this.frameTime > 16.5) {  
        this.frameTime = 0;
	}

    var cam = this.cameras.main;
	
	var currentHeight = (window.innerHeight);
	ZOOM_LEVEL = (currentHeight-(currentHeight % 224))/224;
	if (ZOOM_LEVEL == 0) ZOOM_LEVEL = 1; 
	
	resizeCanvas();
	
	var currentWidth = (window.innerWidth);
	
	text3.x = (currentWidth/2)/ZOOM_LEVEL;
	text4.x = (currentWidth/2)/ZOOM_LEVEL;

	gameTick++;

    if (cam.deadzone)
    {
        text.setText([
            'ScrollX: ' + cam.scrollX,
            'ScrollY: ' + cam.scrollY,
            'MidX: ' + cam.midPoint.x,
            'MidY: ' + cam.midPoint.y,
            'deadzone left: ' + cam.deadzone.left,
            'deadzone right: ' + cam.deadzone.right,
            'deadzone top: ' + cam.deadzone.top,
            'deadzone bottom: ' + cam.deadzone.bottom
        ]);
    }
    else
    {
        text.setText([
            'ScrollX: ' + cam.scrollX,
            'ScrollY: ' + cam.scrollY,
			'CamX: ' + cam.x,
            'CamY: ' + cam.y,
			'PlayerX: ' + (player.x),
			'PlayerY: ' + player.y,
			'Sprites: ' + player.sprites,
			'XMove: ' + player.xMove.split("").reverse().join(""),
			'YMove: ' + player.yMove.split("").reverse().join("")
        ]);
    }
	
	if(gameTick % 2 === 0) {
		
		var xMove = 0;
		var yMove = 0;
		
		if (!slided){
			if (cursors.left.isDown)
			{
				
				xMove=-2;
				if (!moved && (gameTick - player.lastLeft) <= 15){
					player.runDirection = 0;
					runned = true;
				}
				if (!moved && !runned) player.movingFrame++;
				if (!moved) player.lastLeft = gameTick;
				if (player.runDirection != 0 && runned) {
					runned = false;
					slided = true;
					player.slideAcceleration = 4;
				} else {
					player.flipX = true;
				}
				moved = true;
			}
			else if (cursors.right.isDown)
			{
				xMove=2;
				if (!moved && (gameTick - player.lastRight) <= 15){
					player.runDirection = 1;
					runned = true;
				}
				if (!moved && !runned) player.movingFrame++;
				if (!moved) player.lastRight = gameTick;
				if (player.runDirection != 1 && runned) {
					runned = false;
					slided = true;
					player.slideAcceleration = -4;
				} else {
					player.flipX = false;
				}
				moved = true;
			}

			if (cursors.up.isDown)
			{
				yMove=-2;
				if (!runned) {
					if (xMove>1) xMove=1;
					if (xMove<-1) xMove=-1;
				}
				if (xMove!=0) yMove=-1;
				if (!moved) player.movingFrame++;
				moved = true;
			}
			else if (cursors.down.isDown)
			{
				yMove=2;
				if (!player.altFrame) {yMove=1;}
				player.altFrame = !player.altFrame;
				if (!runned) {
					if (xMove>1) xMove=1;
					if (xMove<-1) xMove=-1;
				}
				if (xMove!=0) yMove=1;
				if (!moved) player.movingFrame++;
				moved = true;
			}
		}
		
		if (runned){
			if (player.runDirection == 0) xMove = -4;
			if (player.runDirection == 1) xMove = 4;
			if (yMove>1) yMove=1;
			if (yMove<-1) yMove=-1;
		}
		
		if (!cursors.left.isDown && !cursors.right.isDown && !cursors.up.isDown && !cursors.down.isDown && !runned && !slided) {
			moved = false;
		}
		
		if (slided) {
			player.setFrame('sprite1');
			xMove = Math.floor(player.slideAcceleration);
			player.slideAcceleration = player.slideAcceleration*0.80;
			if (Math.abs(player.slideAcceleration) < 1) slided = false;
		}
		else if (!moved) {
			player.setFrame('sprite1');
			player.movingFrame = 0;
			player.sprites = '';
			player.xMove = '';
			player.yMove = '';
			player.altFrame = false;
		} else {	
			if (!runned) {
				if (player.movingFrame >= 3 && player.movingFrame <= 5  ) {
					player.setFrame('sprite3')
					player.sprites += '3';
				} else if (player.movingFrame >= 9) {
					player.setFrame('sprite2')
					player.sprites += '2';
				} else {
					player.setFrame('sprite1')
					player.sprites += '1';
				}	
			} else {
				if (player.movingFrame >= 2) {
					player.setFrame('sprite4')
					player.sprites += '4';
				} else {
					player.setFrame('sprite1')
					player.sprites += '1';
				}	
			}
			player.movingFrame++;
		}
			
		if (player.movingFrame > 11 && !runned) {
			player.movingFrame = 0;
		}
		
		if (player.movingFrame > 3 && runned) {
			player.movingFrame = 0;
		}		
		
		
		//check bounding box
		
		player.x+=xMove;
		player.y+=yMove;
		
		player.xMove += xMove;
		player.yMove += yMove;
		
		if (player.x < bounds[0]) player.x = bounds[0];
		if (player.y < bounds[1]) player.y = bounds[1];
		if (player.x > bounds[2]) player.x = bounds[2];
		if (player.y > bounds[3]) player.y = bounds[3];
		
		limitScrollRight = Math.floor(((window.innerWidth)/ZOOM_LEVEL)*0.8);
		limitScrollLeft = Math.floor(((window.innerWidth)/ZOOM_LEVEL)*0.266);
		if (((player.x+8)-cam.scrollX)>limitScrollRight ) {
			cam.scrollX+= ((player.x+8)-cam.scrollX)-limitScrollRight;
		} else if (((player.x+8)-cam.scrollX)<limitScrollLeft) {
			cam.scrollX-= ((player.x+8)*-1+cam.scrollX)+limitScrollLeft;
		}
		
		if (cam.scrollX > camXBound) cam.scrollX = camXBound;
		if (cam.scrollX < 0) cam.scrollX = 0;
	
	}
}

function getQueryParams(qs) {
    qs = qs.split('+').join(' ');

    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}

function roundToEven(value) {
  return Number.isNaN(value)
    ? 0.0
    : 2 * Math.round(value / 2);
}

function resizeCanvas() {
    game.scale.canvas.style.width  = (window.innerWidth)*ZOOM_LEVEL + 'px';
	game.scale.canvas.style.height  = (window.innerHeight)*ZOOM_LEVEL + 'px';	
	camXBound = Math.floor(759-((window.innerWidth)/ZOOM_LEVEL))
}
window.addEventListener("resize", () => {
		resizeCanvas();
    },false
);