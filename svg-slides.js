'use strict';

class SvgSlides {
  constructor () {
    var self = this;

    console.log('Powered by d3 v' + d3.version);
    var svg = d3.select('svg');
    svg.attr('preserveAspectRatio', 'xMidYMid meet');
    svg.attr('width', '100%');
    svg.attr('height', '100%');

    var slidePrefix = 'slide_';
    var slides = svg.selectAll(`[id^=${slidePrefix}]`);

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

      function onClickSlide (event) {
        self.currentSlideId = slideNode.id;
      }
    });

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('hashchange', onHashChange);

    svg.on('wheel', onMouseWheel);

    // start presentation
    onHashChange();

    function onHashChange () {
      var slideId = self.currentSlideId;
      if (!slideId) {
        if (sortedSlideIds.length > 0) {
          self.currentSlideId = sortedSlideIds[0];
        } else {
          self.currentSlideId = 'overview';
        }
        return;
      }

      var viewBoxPattern = /viewBox=(-?\d+\.?\d*),(-?\d+\.?\d*),(-?\d+\.?\d*),(-?\d+\.?\d*)/;

      if (slideId === 'overview') {
        console.log(`Transitioning to overview..`);
        transitionTo(svg.node());
      } else if (viewBoxPattern.test(slideId)) {
        var match = viewBoxPattern.exec(slideId);
        var viewBox = {
          left: match[1],
          top: match[2],
          width: match[3],
          height: match[4]
        };
        console.log(`Setting viewBox to ${viewBox.left},${viewBox.top},${viewBox.width},${viewBox.height}...`);
        svg.attr('viewBox', `${viewBox.left} ${viewBox.top} ${viewBox.width} ${viewBox.height}`);
      } else {
        console.log(`Transitioning to slide ${slideId}...`);
        var slideNode = d3.select('#' + slideId).node();
        transitionTo(slideNode);
      }
    }

    function onKeyDown (event) {
      var currentSlideIndex = sortedSlideIds.indexOf(self.currentSlideId);
      var key = event.code || event.keyIdentifier;
      switch (key) {
        case 'ArrowLeft':
        case 'Left':
          if (currentSlideIndex > 0) {
            self.currentSlideId = sortedSlideIds[currentSlideIndex - 1];
          }
          break;
        case 'ArrowRight':
        case 'Right':
        case 'Space':
          if (currentSlideIndex < sortedSlideIds.length - 1) {
            self.currentSlideId = sortedSlideIds[currentSlideIndex + 1];
          }
          break;
        case 'End':
          self.currentSlideId = sortedSlideIds[sortedSlideIds.length - 1];
          break;
        case 'Home':
          self.currentSlideId = sortedSlideIds[0];
          break;
        case 'Escape':
        case 'U+001B':
          self.currentSlideId = 'overview';
          break;
        default:
          console.log(`No keybinding for ${key}`);
      }
    }

    function onMouseWheel () {
      var zoom;
      if (d3.event.wheelDelta > 0) {
        console.log('Zooming in');
        zoom = 0.8;
      } else {
        console.log('Zooming out');
        zoom = 1.25;
      }

      var oldViewBox = svg.attr('viewBox')
        .split(' ')
        .map(function (component) {
          return parseInt(component);
        });

      var mouse = d3.mouse(this);
      var viewBox = {
        left: mouse[0] - (mouse[0] - oldViewBox[0]) * zoom,
        top: mouse[1] - (mouse[1] - oldViewBox[1]) * zoom,
        width: oldViewBox[2] * zoom,
        height: oldViewBox[3] * zoom
      };
      setViewBox(viewBox);
    }

    function setViewBox (viewBox) {
      window.location.hash = `#viewBox=${viewBox.left},${viewBox.top},${viewBox.width},${viewBox.height}`;
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

      console.log(`Setting viewBox to ${viewBox.left},${viewBox.top},${viewBox.width},${viewBox.height}...`);
      svg.transition()
        .attr('viewBox', `${viewBox.left} ${viewBox.top} ${viewBox.width} ${viewBox.height}`);
    }
  }

  get currentSlideId () {
    var hash = window.location.hash || '';
    if (hash === '') {
      return null;
    } else {
      return hash.replace(/^#/, '');
    }
  }

  set currentSlideId (slideId) {
    window.location.hash = `#${slideId}`;
  }

  static load () {
    window.addEventListener('load', function () {
      new SvgSlides();
    });
  }
}
