import scrapy

class WallpaperFlareImageItem(scrapy.Item):
    image_urls = scrapy.Field()
    images = scrapy.Field()
    extra = scrapy.Field()

class WallpaperFlare(scrapy.Spider):
    name = 'wallpaperflare'

    custom_settings = {
        'IMAGES_STORE': f'data/{name}',
    }

    start_urls = ['https://www.wallpaperflare.com/tag/nature?page=1']

    def parse(self, response):
        items = response.selector.xpath('//li[@itemprop="associatedMedia"]')
        for li in items:
            extra = {
                'caption': li.xpath('figure/figcaption').extract_first(),
            }
            full_url = li.xpath('link[@itemprop="contentUrl"]/@href').extract_first()
            yield WallpaperFlareImageItem(image_urls=[full_url], extra=extra)
