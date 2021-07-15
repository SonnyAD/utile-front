import 'dart:html' hide File;

import 'config.dart' as config;

void main() {
  querySelector('#output')?.style.display = 'none';

  var links = [
    {
      'link': '/#home',
      'label': '/',
      'description': 'Homepage',
      'title': 'Homepage'
    },
    {
      'link': '/#dices',
      'label': '/d[2-100]',
      'description': 'Roll any dice between 2 and 100 faces',
      'title': 'Roll a dice'
    },
    {
      'link': '/ip/',
      'label': '/ip/',
      'description': 'Get your IP',
      'title': 'Get your IP'
    },
    {
      'link': '/pdf/',
      'label': '/pdf/',
      'description': 'Free PDF files I am resharing',
      'title': 'Free PDF'
    },
  ];

  loadLinks(querySelector('#links'), links);

  refreshPageAccordingToHash();

  window.onHashChange.listen((Event e) {
    refreshPageAccordingToHash();
  });

  querySelector('#dice2')?.addEventListener('click', (event) {
    final httpRequest = HttpRequest();
    const path = config.apiRootUrl + '/api/d2';
    httpRequest
      ..open('GET', path)
      ..onLoadEnd.listen((e) => requestComplete(event, httpRequest))
      ..send('');
  });

  querySelector('#dice6')?.addEventListener('click', (event) {
    final httpRequest = HttpRequest();
    const path = config.apiRootUrl + '/api/d6';
    httpRequest
      ..open('GET', path)
      ..onLoadEnd.listen((e) => requestComplete(event, httpRequest))
      ..send('');
  });

  querySelector('#dice20')?.addEventListener('click', (event) {
    final httpRequest = HttpRequest();
    const path = config.apiRootUrl + '/api/d20';
    httpRequest
      ..open('GET', path)
      ..onLoadEnd.listen((e) => requestComplete(event, httpRequest))
      ..send('');
  });

  querySelector('#dice100')?.addEventListener('click', (event) {
    final httpRequest = HttpRequest();
    const path = config.apiRootUrl + '/api/d100';
    httpRequest
      ..open('GET', path)
      ..onLoadEnd.listen((e) => requestComplete(event, httpRequest))
      ..send('');
  });

  querySelector('#version')?.innerHtml = 'v0.0.1';
}

void requestComplete(Event event, HttpRequest request) {
  if (request.status == 200) {
    final response = request.responseText;
    if (response != null) {
      Element? element = event.target as Element;
      element.innerHtml = response;
      return;
    }
  }
}

void refreshPageAccordingToHash() {
  //Capture Hash
  var hash = window.location.hash;
  //Check hash
  if (hash == '#dices') {
    querySelector('#output')?.style.display = '';
  } else {
    querySelector('#output')?.style.display = 'none';
  }
}

void loadLinks(Element? uList, List<Map> elements) {
  if (uList == null) return;

  for (var element in elements) {
    var li = LIElement();
    li.innerHtml = '<a href="' +
        element['link'] +
        '" title="' +
        element['title'] +
        '">' +
        element['label'] +
        '</a>: ' +
        element['description'];
    uList.append(li);
  }
}
