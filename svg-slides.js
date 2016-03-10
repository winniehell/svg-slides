window.addEventListener('load', function () {
  console.log('Powered by d3 v' + d3.version);
  var svg = d3.select('svg');
  svg.attr('preserveAspectRatio', 'xMidYMid meet');
  svg.attr('width', '100%');
  svg.attr('height', '100%');

  var slides = svg.selectAll('[id^=slide_]');

  var sortedSlideIds = slides[0].map(function (slide) {
    return slide.id;
  }).sort();

  if (sortedSlideIds.length > 0) {
    console.log(`Found the following slides: ${sortedSlideIds}`);
  } else {
    console.error('Found no slides!');
  }

  sortedSlideIds.forEach(function (slideId, index) {
    if (sortedSlideIds.indexOf(slideId) != index) {
      console.error(`Found duplicate slide: ${slideId}`);
    }
  });

  slides[0].forEach(function (slideNode) {
    slideNode.addEventListener('click', onClickSlide);
  });

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('hashchange', onHashChange);

  onHashChange();

  function getCurrentSlideId () {
    var hash = window.location.hash || '';
    if (hash === '') {
      return null;
    } else {
      return hash.replace(/^#/, '');
    }
  }

  function onClickSlide (event) {
    setCurrentSlideId(event.target.id);
  }

  function onHashChange () {
    var slideId = getCurrentSlideId();
    if (!slideId) {
      if (sortedSlideIds.length > 0) {
        setCurrentSlideId(sortedSlideIds[0]);
      } else {
        setCurrentSlideId('overview');
      }
      return;
    }

    console.log(`Transitioning to slide ${slideId}...`);
    if (slideId === 'overview') {
      transitionTo(svg.node());
    } else {
      var slideNode = d3.select('#' + slideId).node();
      transitionTo(slideNode);
    }
  }

  function onKeyDown (event) {
    var currentSlideIndex = sortedSlideIds.indexOf(getCurrentSlideId());
    var key = event.code || event.keyIdentifier;
    switch (key) {
      case 'ArrowLeft':
      case 'Left':
        if (currentSlideIndex > 0) {
          setCurrentSlideId(sortedSlideIds[currentSlideIndex - 1]);
        }
        break;
      case 'ArrowRight':
      case 'Right':
        if (currentSlideIndex < sortedSlideIds.length - 1) {
          setCurrentSlideId(sortedSlideIds[currentSlideIndex + 1]);
        }
        break;
      case 'Escape':
      case 'U+001B':
        setCurrentSlideId('overview');
        break;
      default:
        console.log(`No keybinding for ${key}`);
    }
  }

  function setCurrentSlideId (slideId) {
    window.location.hash = '#' + slideId;
  }

  function transitionTo (svgElement) {
    if (!svgElement) {
      return;
    }

    var boundingBox = svgElement.getBBox();
    var margin = {
      x: boundingBox.width / 100,
      y: boundingBox.height / 100
    };
    var viewBox = {
      left: boundingBox.x - margin.x,
      top: boundingBox.y - margin.y,
      width: boundingBox.width + 2 * margin.x,
      height: boundingBox.height + 2 * margin.y
    };

    svg.transition()
      .attr('viewBox', `${viewBox.left} ${viewBox.top} ${viewBox.width} ${viewBox.height}`);
  }
});
