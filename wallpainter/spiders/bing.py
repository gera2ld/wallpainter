import json
import scrapy

class BingImageItem(scrapy.Item):
    image_urls = scrapy.Field()
    images = scrapy.Field()
    extra = scrapy.Field()

class Bing(scrapy.Spider):
    name = 'bing'

    custom_settings = {
        'IMAGES_STORE': f'data/{name}',
    }

    start_urls = ['https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=10']

    def parse(self, response):
        meta_data = json.loads(response.text)
        for image in meta_data['images']:
            rel_url = image['url']
            full_url = f'https://cn.bing.com{rel_url}'
            yield BingImageItem(image_urls=[full_url], extra=image)
