import importlib.util, pathlib, unittest, datetime as dt
from xml.etree import ElementTree as ET
P=pathlib.Path(__file__).resolve().parents[1]/'scripts'/'update_news.py'
spec=importlib.util.spec_from_file_location('update_news',P); mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
class PipelineTests(unittest.TestCase):
 def test_known_domain(self):
  self.assertEqual(mod.source_for('', 'https://www.nih.gov/news'), 'NIH')
 def test_prevent_source_spoofing(self):
  self.assertIsNone(mod.source_for('NIH','https://example.org/story'))
 def test_reject_non_https(self):
  item=ET.fromstring('<item><title>Exercise Research and Daily Physical Activity Findings</title><link>http://nih.gov/a</link><pubDate>Mon, 02 Nov 2026 00:00:00 +0000</pubDate><description>hello</description></item>')
  self.assertIsNone(mod.parse(item,'Salud'))
 def test_allowlist_only(self):
  self.assertIsNone(mod.source_for('Unknown','https://example.com/story'))
if __name__=='__main__':unittest.main()
