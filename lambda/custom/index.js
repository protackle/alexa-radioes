var Alexa = require('ask-sdk-core');

const LaunchHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    return askRadio(handlerInput);
  }
};

const PlaybackIntentHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

    return request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name.indexOf('AMAZON.') >= 0;
  },
  handle(handlerInput) {
    const intent = handlerInput.requestEnvelope.request.intent.name;

    const isPause =
      [
        'AMAZON.PauseIntent',
        'AMAZON.StopIntent',
        'AMAZON.CancelIntent'
      ].indexOf(intent) >= 0;

    const isResume = ['AMAZON.ResumeIntent'].indexOf(intent) >= 0;

    if (isResume) {
      return startPlayback(handlerInput, true);
    } else if (isPause) {
      return pausePlayback(handlerInput, true);
    } else {
      return doNothing(handlerInput);
    }
  }
};

const CustomIntentHandler = {
    canHandle(handlerInput) {
      const request = handlerInput.requestEnvelope.request;
      return request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name.indexOf('AMAZON.') < 0;
    },
    handle(handlerInput) {
      const intent = handlerInput.requestEnvelope.request.intent.name;

      switch(intent) {
          case 'selectRadio':
            return selectRadio(handlerInput);
          default:
            return doNothing(handlerInput);
      }
    }
  };

const PauseHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === 'AudioPlayer.PlaybackStopped' ||
      request.type === 'AudioPlayer.PlaybackFinished' ||
      request.type === 'AudioPlayer.PlaybackPaused'
    );
  },
  handle(handlerInput) {
    const responseBuilder = handlerInput.responseBuilder;
    return responseBuilder.getResponse();
  }
};

const NothingHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === 'AudioPlayer.PlaybackStarted' ||
      request.type === 'AudioPlayer.PlaybackNearlyFinished' ||
      request.type === 'AudioPlayer.PlaybackFailed' ||
      request.type === 'SessionEndedRequest'
    );
  },
  handle(handlerInput) {
    const responseBuilder = handlerInput.responseBuilder;
    return responseBuilder.getResponse();
  }
};

const ErrorHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'System.ExceptionEncountered';
  },
  handle(handlerInput) {
    console.log('\n******************* EXCEPTION **********************');
    console.log('\n' + JSON.stringify(handlerInput.requestEnvelope, null, 2));

    return doNothing(handlerInput);
  }
};

// Playback aux functions

const selectRadio = (handlerInput) => {
    const station = handlerInput.requestEnvelope.request.intent.slots.station.value;
    if (URLS[station]) {
        console.log('starts playback of ' + station);
        return startPlayback(handlerInput, false, station);
    } else {
        console.log('Not Found: ' + station);
        return sayNotFound(handlerInput, station);
    }
}

const askRadio = (handlerInput) => {
    const responseBuilder = handlerInput.responseBuilder;
    return responseBuilder
      .speak(MESSAGES.HELP + MESSAGES.REQUEST_TALK)
      .getResponse();
}

const startPlayback = (handlerInput, resume = false, station) => {
    console.log('starts playback of ' + station);
    const responseBuilder = handlerInput.responseBuilder;
    const talk = resume ? '' : getRandomMessage('START');
    return responseBuilder
      .speak(talk)
      .addAudioPlayerPlayDirective('REPLACE_ALL', URLS[station], 'esradio_stream')
      .getResponse();
  };
  
  const pausePlayback = (handlerInput) => {
    const responseBuilder = handlerInput.responseBuilder;
    return responseBuilder
      .addAudioPlayerStopDirective()
      .getResponse();
  };
  
  const doNothing = (handlerInput) => {
    const responseBuilder = handlerInput.responseBuilder;
    return responseBuilder
      .getResponse();
  };

  const sayNotFound = (handlerInput, station) => {
    const responseBuilder = handlerInput.responseBuilder;
    const speech = `Lo siento, ${station} no es una emisora disponible.`
    return responseBuilder
      .speak(speech)
      .getResponse();
  };

// FUNCTIONS
function getRandomMessage(msg) {
  const random_idx = Math.floor(Math.random() * (msg.length - 1, 0));
  return MESSAGES[msg][random_idx];
}

// CONSTANTS
const MESSAGES = {
  START: ['Aquí lo tienes', 'Vamos allá', 'Conectamos'],
  PAUSE: ['Radio pausada', 'A la espera', 'Te espero'],
  HELP: 'Para usar la skill radios de españa, di por ejemplo ',
  REQUEST_TALK: 'alexa, abre radios de españa y ponme esradio'
};

const URLS = {
  'esradio': 'https://livestreaming3.esradio.fm/stream64.mp3',
  'es radio': 'https://livestreaming3.esradio.fm/stream64.mp3',
  'libertad digital': 'https://livestreaming3.esradio.fm/stream64.mp3',
  'cope': 'https://net1.cope.stream.flumotion.com/cope/net1.mp3',
  'ser': 'https://playerservices.streamtheworld.com/api/livestream-redirect/CADENASER.mp3',
  'onda cero': 'https://icecast-streaming.nice264.com/ondacero',
  'marca': 'https://radiomarca.streaming-pro.com:8031/radiomarca.mp3',
  'eme 80': 'https://playerservices.streamtheworld.com/api/livestream-redirect/M80RADIO.mp3',
  'm80': 'https://playerservices.streamtheworld.com/api/livestream-redirect/M80RADIO.mp3',
  'm 80': 'https://playerservices.streamtheworld.com/api/livestream-redirect/M80RADIO.mp3',
  'kiss f.m': 'https://kissfm.kissfmradio.cires21.com/kissfm.mp3',
  'kiss FM': 'https://kissfm.kissfmradio.cires21.com/kissfm.mp3',
  'kiss f': 'https://kissfm.kissfmradio.cires21.com/kissfm.mp3',
  'los 40': 'https://playerservices.streamtheworld.com/api/livestream-redirect/Los40.mp3',
  'los 40 principales': 'https://playerservices.streamtheworld.com/api/livestream-redirect/Los40.mp3',
  'dial': 'https://playerservices.streamtheworld.com/api/livestream-redirect/CADENADIAL.mp3',
  'rock FM': 'https://rockfm.cope.stream.flumotion.com/cope/rockfm.mp3',
  '100': 'https://cadena100.cope.stream.flumotion.com/cope/cadena100.mp3.m3u',
  'cien': 'https://cadena100.cope.stream.flumotion.com/cope/cadena100.mp3',
  'radio nacional': 'https://195.55.74.204/rtve/rtve-rne.mp3',
  'radio 5': 'https://195.55.74.204/rtve/rtve-rne.mp3',
  'radio cinco': 'https://195.55.74.204/rtve/rtve-rne.mp3',
  'radio clásica': 'https://195.10.10.201/rtve/rtve-radioclasica.mp3',
  'radio nacional clásica': 'https://195.10.10.201/rtve/rtve-radioclasica.mp3',
  'radio 3': 'https://195.10.10.225/rtve/rtve-radio3.mp3',
  'radio tres': 'https://195.10.10.225/rtve/rtve-radio3.mp3',
  'error': 'https://vxtals.es'
};

const skillBuilder = Alexa.SkillBuilders.custom();
exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchHandler,
    PauseHandler,
    NothingHandler,
    PlaybackIntentHandler,
    CustomIntentHandler,
    ErrorHandler
  )
  .lambda();
