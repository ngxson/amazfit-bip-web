import { BipBitmap, ResAsset, ResFile } from 'amazfit-bip-tools-ts';
import { useEffect, useState } from 'react';
import {
  ResFileWrapped,
  getResByName,
  loadAllRes,
  saveCustomRes,
} from './ResUtils';
import { Button, Card, Col, Spinner } from 'react-bootstrap';
import { byteToKB, delay, downloadArrayBuffer } from '../Utils';

export function ResEditor({
  onChangeViewToApps,
}: {
  onChangeViewToApps(): void;
}) {
  const [listUsableRes, setListUsableRes] = useState<ResFileWrapped[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [res, setResNoPostProcess] = useState<ResFile>();

  const setRes = async (res?: ResFile) => {
    setLoading(true);
    if (res) {
      for (const asset of res.assets) {
        if (asset.type() !== 'bm') continue;
        decodeBMAsset(asset);
        await delay(0);
      }
    }
    setResNoPostProcess(res);
    setLoading(false);
  };

  // get current res file
  useEffect(() => {
    (async () => {
      setListUsableRes((await loadAllRes()).filter((r) => r.name !== 'custom'));
      setRes((await getResByName('custom'))?.file);
    })();
  }, []);

  const renderLoading = () => (
    <Col xs={12}>
      <br />
      <br />
      <Spinner />
      <br />
      Please wait...
    </Col>
  );

  const renderPicker = () => (
    <Col xs={12}>
      Pick a base .res file:
      <br />
      <br />
      {listUsableRes.map((r) => (
        <div key={r.name} style={{ marginBottom: '0.5em' }}>
          <Button
            onClick={() => {
              saveCustomRes(r.file);
              setRes(r.file);
            }}
          >
            {r.name}
          </Button>
        </div>
      ))}
    </Col>
  );

  const renderAssetEditor = () => {
    if (!res) return null;
    return (
      <>
        <Col xs={12}>
          <br />
          <br />
          Number of assets: {res.assets.length.toString().padStart(4, '0')}
          &nbsp;&nbsp;&nbsp;
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              if (
                window.confirm(
                  'This will erase any changes you made to this res file. Continue?'
                )
              ) {
                saveCustomRes();
                setRes();
              }
            }}
          >
            Reset
          </Button>
          <br />
          <br />
        </Col>
        {res.assets.map((asset, i) => {
          return <DisplayAsset asset={asset} key={i} i={i} />;
        })}
        <div>
          <br />
          <br />
          <br />
          <br />
        </div>
      </>
    );
  };

  return (
    <>
      <Col xs={12}>
        <h1>
          <Button onClick={onChangeViewToApps}>
            <i className="fa-solid fa-arrow-left" /> Back
          </Button>{' '}
          Res Editor
        </h1>
      </Col>

      {loading ? renderLoading() : res ? renderAssetEditor() : renderPicker()}
    </>
  );
}

interface BMType {
  hash: string;
  asset: ResAsset;
  bm: BipBitmap;
  url: string;
}
const BM_CACHE: { [hash: string]: BMType } = {};
const decodeBMAsset = (asset: ResAsset) => {
  const hash = asset.hash();
  if (BM_CACHE[hash]) {
    return BM_CACHE[hash];
  }
  const bm = new BipBitmap(asset);
  const blob = new Blob([bm.toBMP()], { type: 'image/bmp' });
  const url = URL.createObjectURL(blob).toString();
  const entry = { asset, bm, url, hash };
  BM_CACHE[hash] = entry;
  return entry;
};

function DisplayAsset({ asset, i }: { asset: ResAsset; i: number }) {
  const type = asset.type();
  const idx = i.toString().padStart(4, '0');

  const renderPreview = () => {
    if (type === 'bm') {
      const bm = decodeBMAsset(asset);
      return (
        <div className="img-view">
          <img src={bm.url} />
        </div>
      );
    } else {
      return (
        <div className="img-view">
          Asset type: <b>{type}</b>
          <br />
          Size: {byteToKB(asset.data.byteLength)}
          <br />
          <br />
          (This asset is not a bitmap)
          <br />
        </div>
      );
    }
  };

  return (
    <Col xs={12} md={4} lg={2}>
      <Card className="asset">
        Index: {idx}
        {renderPreview()}
        <div>
          <Button
            size="sm"
            onClick={() => {
              if (type === 'bm') {
                downloadArrayBuffer(
                  decodeBMAsset(asset).bm.toBMP(),
                  `${idx}.bmp`
                );
              } else {
                downloadArrayBuffer(asset.data, `${idx}.bin`);
              }
            }}
          >
            <i className="fa-solid fa-download" />
          </Button>
          &nbsp;
          <Button
            size="sm"
            onClick={() => alert('This feature will be available soon')}
          >
            <i className="fa-solid fa-edit" />
          </Button>
        </div>
      </Card>
    </Col>
  );
}
