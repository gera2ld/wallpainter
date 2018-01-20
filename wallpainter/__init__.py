import scrapy
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings

def crawl():
    process = CrawlerProcess(get_project_settings())
    process.crawl('bing')
    process.crawl('wallpaperflare')
    process.start()
