/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { Skeleton, Steps, Button } from 'antd';
import { getDetailPesanan } from '@/services/pesanan';
import Pesanan from '@/types/Pesanan';
import { AxiosResponse } from 'axios';
import moment from 'moment';
import { formatCurrency } from '@/helpers/order_helper';
import {
  CheckCircleFilled,
  ClockCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled,
  CopyOutlined,
  InfoCircleOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { Link, useParams } from 'react-router-dom';
import ModalKonfirmasiVerifikasiPersyaratan from '@/components/ModalKonfirmasiVerifikasiPersyaratanComponent';
import { handleCopy } from '@/helpers/string_helper';
import ModalKonfirmasiPengiriman from '@/components/ModalKonfirmasiPengirimanComponent';
import DaftarProdukPesanan from '@/components/DaftarProdukPesananComponent';

const Row = ({ children, className = '' }: any) => (
  <div className={`flex justify-between space-x-5 ${className}`}>{children}</div>
);

export default function HalamanDetailPesanan() {
  const { id } = useParams();

  const [loading, setLoading] = useState<boolean>(true);
  const [pesanan, setPesanan] = useState<Pesanan>(null);
  const [stepsPosition, setStepsPosition] = useState<number>(0);
  const [showModalKonfirmasi, setShowModalKonfirmasi] = useState<boolean>(false);
  const [showModalAturPengiriman, setShowModalAturPengiriman] = useState<boolean>(false);

  const handleLoadData = () => {
    setLoading(true);
    getDetailPesanan(id).then(({ data }: AxiosResponse<Pesanan>) => {
      const has_verifikasi_persyaratan = data.riwayat.find(
        (i) => i.status === 'VERIFIKASI_PERSYARATAN',
      );
      setPesanan(data);
      setLoading(false);
      if (data.status === 'DIBATALKAN') {
        setStepsPosition(1);
      } else {
        if (data.riwayat.find((i) => i.status === 'SELESAI'))
          setStepsPosition(has_verifikasi_persyaratan ? 4 : 3);
        else if (data.riwayat.find((i) => i.status === 'DIKIRIM'))
          setStepsPosition(has_verifikasi_persyaratan ? 3 : 2);
        else if (data.riwayat.find((i) => i.status === 'DIKEMAS'))
          setStepsPosition(has_verifikasi_persyaratan ? 2 : 1);
        else if (data.riwayat.find((i) => i.status === 'MENUNGGU_PEMBAYARAN'))
          setStepsPosition(has_verifikasi_persyaratan ? 1 : 0);
        else setStepsPosition(0);
      }
    });
  };

  useEffect(() => {
    handleLoadData();
  }, [id]);

  return (
    <section className="px-5 py-5 pt-10">
      {loading && <Skeleton active />}
      {!loading && (
        <>
          {pesanan.status === 'VERIFIKASI_PERSYARATAN' && pesanan.persyaratan && (
            <ModalKonfirmasiVerifikasiPersyaratan
              visible={showModalKonfirmasi}
              pesanan={pesanan}
              onCancel={() => setShowModalKonfirmasi(false)}
              onFinishConfirmation={(p) => {
                setShowModalKonfirmasi(false);
                handleLoadData();
              }}
            />
          )}
          {pesanan.status === 'DIKEMAS' && (
            <ModalKonfirmasiPengiriman
              visible={showModalAturPengiriman}
              pesanan={pesanan}
              onFinish={(p) => {
                setPesanan((old) => ({ ...old, ...p }));
                setShowModalAturPengiriman(false);
              }}
              onCancel={() => setShowModalAturPengiriman(false)}
            />
          )}
          <Steps
            current={stepsPosition}
            status={pesanan.status === 'DIBATALKAN' ? 'error' : 'process'}
          >
            {pesanan.riwayat.find((i) => i.status === 'VERIFIKASI_PERSYARATAN') && (
              <Steps.Step
                title="Verifikasi Persyaratan"
                description={moment(new Date(pesanan.created_at)).format(
                  'DD-MMM-yyyy HH:mm',
                )}
              />
            )}
            {pesanan.status === 'DIBATALKAN' &&
              pesanan.riwayat.find((i) => i.status === 'VERIFIKASI_PERSYARATAN') && (
                <Steps.Step
                  title="Dibatalkan"
                  description={moment(
                    new Date(
                      pesanan.riwayat.find((i) => i.status === 'DIBATALKAN').created_at,
                    ),
                  ).format('DD-MMM-yyyy HH:mm')}
                />
              )}
            <Steps.Step
              title="Menunggu Pembayaran"
              description={
                pesanan.riwayat.find((i) => i.status === 'MENUNGGU_PEMBAYARAN')
                  ? moment(
                      new Date(
                        pesanan.riwayat.find(
                          (i) => i.status === 'MENUNGGU_PEMBAYARAN',
                        ).created_at,
                      ),
                    ).format('DD-MMM-yyyy HH:mm')
                  : '-'
              }
            />
            {pesanan.status === 'DIBATALKAN' &&
              !pesanan.riwayat.find((i) => i.status === 'VERIFIKASI_PERSYARATAN') && (
                <Steps.Step
                  title="Dibatalkan"
                  description={moment(
                    new Date(
                      pesanan.riwayat.find((i) => i.status === 'DIBATALKAN').created_at,
                    ),
                  ).format('DD-MMM-yyyy HH:mm')}
                />
              )}

            {pesanan.status !== 'DIBATALKAN' && (
              <>
                <Steps.Step
                  title="Dikemas"
                  description={
                    pesanan.riwayat.find((i) => i.status === 'DIKEMAS')
                      ? moment(
                          new Date(
                            pesanan.riwayat.find(
                              (i) => i.status === 'DIKEMAS',
                            ).created_at,
                          ),
                        ).format('DD-MMM-yyyy HH:mm')
                      : '-'
                  }
                />
                <Steps.Step
                  title="Dikirim"
                  description={
                    pesanan.riwayat.find((i) => i.status === 'DIKIRIM')
                      ? moment(
                          new Date(
                            pesanan.riwayat.find(
                              (i) => i.status === 'DIKIRIM',
                            ).created_at,
                          ),
                        ).format('DD-MMM-yyyy HH:mm')
                      : '-'
                  }
                />
                <Steps.Step
                  title="Selesai"
                  description={
                    pesanan.riwayat.find((i) => i.status === 'SELESAI')
                      ? moment(
                          new Date(
                            pesanan.riwayat.find(
                              (i) => i.status === 'SELESAI',
                            ).created_at,
                          ),
                        ).format('DD-MMM-yyyy HH:mm')
                      : '-'
                  }
                />
              </>
            )}
          </Steps>
          <section className="mt-10 grid grid-cols-12 gap-5">
            <div className="col-span-12 lg:col-span-8 space-y-2">
              <div className="bg-white p-5 space-y-1 rounded">
                <h4
                  className={`font-bold text-lg border-b border-dashed pb-3 ${
                    pesanan.status === 'DIBATALKAN' ? 'text-red-500' : 'text-color-theme'
                  }`}
                >
                  {pesanan.status_diff}
                </h4>

                <Row>
                  <span>Konsumen</span>
                  <Link className="text-lg" to={`/konsumen/${pesanan.konsumen.user_id}`}>
                    {pesanan.konsumen.nama}
                  </Link>
                </Row>
                <Row>
                  <span>Tanggal Pembelian</span>
                  <span>{moment(pesanan.created_at).format('Do MMMM yyyy, HH:mm')}</span>
                </Row>
              </div>
              {pesanan.persyaratan && (
                <div
                  className={`bg-white p-5 rounded ${
                    pesanan.persyaratan.status &&
                    `border ${
                      pesanan.persyaratan.status === 'LULUS'
                        ? 'border-green-600'
                        : 'border-red-600'
                    }`
                  }`}
                >
                  <div className="flex justify-between space-x-5 mb-3 items-center">
                    <h4 className="font-bold text-lg mb-0">
                      Info Verifikasi Persyaratan
                    </h4>
                    {pesanan.persyaratan.status === 'TIDAK-LULUS' && (
                      <span className="rounded-full px-4 py-[3px] bg-red-600 text-white text-[small]">
                        <CloseCircleFilled /> &nbsp;Tidak Lulus
                      </span>
                    )}
                    {pesanan.persyaratan.status === 'LULUS' && (
                      <span className="rounded-full px-4 py-[3px] bg-green-600 text-white text-[small]">
                        <CheckCircleFilled /> &nbsp;Lulus Verifikasi
                      </span>
                    )}
                    {!pesanan.persyaratan.status && (
                      <span className="rounded-full px-4 py-[3px] bg-color-theme text-white text-[small]">
                        <ClockCircleOutlined /> &nbsp;Menunggu Konfirmasi
                      </span>
                    )}
                  </div>
                  <hr className="border-dashed mb-4" />
                  <div className="space-y-1">
                    <Row>
                      <span>Dokumen Surat Lahan</span>
                      <a
                        target="_blank"
                        href={pesanan.persyaratan.dokumen_surat_lahan.url}
                        rel="noreferrer"
                      >
                        {pesanan.persyaratan.dokumen_surat_lahan.name} <LinkOutlined />
                      </a>
                    </Row>
                    <Row>
                      <span>Dokumen Surat Pernyataan</span>
                      <a
                        target="_blank"
                        href={pesanan.persyaratan.dokumen_surat_pernyataan.url}
                        rel="noreferrer"
                      >
                        {pesanan.persyaratan.dokumen_surat_pernyataan.name}{' '}
                        <LinkOutlined />
                      </a>
                    </Row>
                    <Row>
                      <span>Dokumen KTP</span>
                      <a
                        target="_blank"
                        href={pesanan.persyaratan.dokumen_ktp.url}
                        rel="noreferrer"
                      >
                        {pesanan.persyaratan.dokumen_ktp.name} <LinkOutlined />
                      </a>
                    </Row>
                    <Row>
                      <span>Alamat Kebun</span>
                      <p className="mb-0 text-right max-w-[60%]">
                        {pesanan.persyaratan.alamat_lengkap}
                      </p>
                    </Row>
                    {pesanan.persyaratan.status === 'TIDAK-LULUS' && (
                      <>
                        <br />
                        <div className="bg-red-600 px-5 py-3 text-white -mx-5 flex items-center space-x-3">
                          <InfoCircleOutlined />{' '}
                          <p className="mb-0">
                            {pesanan.persyaratan.informasi_penolakan}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
              <div
                className={`bg-white p-5 rounded ${
                  pesanan.informasi_pengiriman.duration && 'border border-green-600'
                }`}
              >
                <div className="flex justify-between mb-4 space-x-5">
                  <h4 className="font-bold text-lg mb-0">Info Pengiriman</h4>
                  {pesanan.informasi_pengiriman.duration && (
                    <span className="bg-green-600 px-3 py-[4px] rounded-full text-white text-[small]">
                      <ClockCircleFilled /> &nbsp; Pengiriman{' '}
                      {moment(pesanan.informasi_pengiriman.duration?.date_to).fromNow()}
                    </span>
                  )}
                </div>

                <hr className="border-dashed mb-4" />
                <div className="space-y-1">
                  {pesanan.informasi_pengiriman.duration && (
                    <>
                      <div className="px-5 py-2 rounded text-green-600 border border-green-600 flex justify-between">
                        <span>
                          {moment(pesanan.informasi_pengiriman.duration.date_from).format(
                            'dddd, Do MMMM yyyy',
                          )}
                        </span>
                        <span>&rarr;</span>
                        <span>
                          {moment(pesanan.informasi_pengiriman.duration.date_to).format(
                            'dddd, Do MMMM yyyy',
                          )}
                        </span>
                      </div>
                      <br />
                    </>
                  )}
                  <Row>
                    <span>No. Resi</span>
                    <span>{pesanan.nomor_resi ?? '-'}</span>
                  </Row>
                  <Row>
                    <span>Catatan</span>
                    <p className="mb-0 text-gray-400 text-right max-w-[60%]">
                      {pesanan.catatan ?? '-'}
                    </p>
                  </Row>
                  <hr className="border-dashed my-2" />
                  <Row>
                    <span>Alamat Pengiriman</span>
                    <div className="text-right max-w-[60%]">
                      <b>{pesanan.informasi_pengiriman.to}</b>
                      <p className="mb-0">
                        {pesanan.informasi_pengiriman.address.no_hp_lengkap}
                      </p>
                      <p className="mb-0">
                        {pesanan.informasi_pengiriman.address.alamat_lengkap}
                      </p>
                    </div>
                  </Row>
                </div>
              </div>

              <div className="p-5 rounded bg-white my-10">
                <DaftarProdukPesanan pesanan={pesanan} />
              </div>

              <div
                className={`p-5 rounded bg-white ${
                  pesanan.tagihan?.status === 'DIBAYAR' && 'border border-green-600'
                }`}
              >
                {pesanan.tagihan && (
                  <>
                    <div className="flex space-x-5 justify-between items-center mb-4">
                      <h4 className="font-bold text-lg mb-0">Info Tagihan</h4>
                      <span
                        className={`${
                          pesanan.tagihan.is_finished
                            ? 'bg-green-600'
                            : pesanan.tagihan.is_canceled
                            ? 'bg-red-600'
                            : 'bg-yellow-500'
                        } rounded-full text-white px-4 py-[3px] text-[small]`}
                      >
                        {pesanan.tagihan.is_finished ? (
                          <CheckCircleFilled />
                        ) : pesanan.tagihan.is_canceled ? (
                          <CloseCircleFilled />
                        ) : (
                          <ClockCircleFilled />
                        )}
                        &nbsp; {pesanan.tagihan?.status}
                      </span>
                    </div>
                    <hr className="border-dashed mb-4" />
                  </>
                )}
                <div className="space-y-2">
                  {pesanan.tagihan && (
                    <>
                      <Row>
                        <span>Nomor Tagihan</span>
                        <button
                          onClick={() => handleCopy(pesanan.tagihan.id, 'Nomor Tagihan')}
                        >
                          {pesanan.tagihan.id}
                          &nbsp;
                          <CopyOutlined />
                        </button>
                      </Row>
                      <Row>
                        <span>Tagihan Dibuat Pada</span>
                        <span>
                          {moment(new Date(pesanan.tagihan.created_at)).format(
                            'dddd, DD MMMM yyyy HH:mm',
                          )}
                        </span>
                      </Row>
                      <Row>
                        <span>Metode Pembayaran</span>
                        <span>{pesanan.tagihan.metode_pembayaran}</span>
                      </Row>
                      {pesanan.tagihan?.payload_pg?.payment_type === 'gopay' && (
                        <Row>
                          <span>QR Code</span>
                          <div className="flex justify-end flex-grow items-end">
                            <img
                              className="max-w-sm"
                              src={
                                pesanan.tagihan.response_pg?.actions?.find(
                                  (i) => i.name === 'generate-qr-code',
                                ).url
                              }
                              alt="QR CODE"
                            />
                          </div>
                        </Row>
                      )}
                      {pesanan.tagihan?.payload_pg?.payment_type === 'qris' && (
                        <Row>
                          <span>QR Code</span>
                          <div className="flex justify-end flex-grow items-end">
                            <img
                              className="max-w-sm"
                              src={
                                pesanan.tagihan.response_pg?.actions?.find(
                                  (i) => i.name === 'generate-qr-code',
                                ).url
                              }
                              alt="QR CODE"
                            />
                          </div>
                        </Row>
                      )}
                      {pesanan.tagihan?.payload_pg?.payment_type === 'bank_transfer' && (
                        <Row>
                          <span>Nomor Virtual Account</span>
                          <button
                            onClick={() =>
                              handleCopy(
                                pesanan.tagihan?.response_pg?.va_numbers?.find(
                                  (i) =>
                                    i.bank ===
                                    pesanan.tagihan.payload_pg?.bank_transfer?.bank,
                                )?.va_number,
                                'Nomor Virtual Account',
                              )
                            }
                          >
                            {
                              pesanan.tagihan?.response_pg?.va_numbers?.find(
                                (i) =>
                                  i.bank ===
                                  pesanan.tagihan.payload_pg?.bank_transfer?.bank,
                              )?.va_number
                            }
                            &nbsp;
                            <CopyOutlined />
                          </button>
                        </Row>
                      )}
                      {pesanan.tagihan?.payload_pg?.payment_type === 'echannel' && (
                        <>
                          <Row>
                            <span>Bill Key</span>
                            <button
                              onClick={() =>
                                handleCopy(
                                  pesanan.tagihan?.response_pg?.bill_key,
                                  'Bill Key',
                                )
                              }
                            >
                              {pesanan.tagihan?.response_pg?.bill_key}
                              &nbsp;
                              <CopyOutlined />
                            </button>
                          </Row>
                          <Row>
                            <span>Bill Code</span>
                            <button
                              onClick={() =>
                                handleCopy(
                                  pesanan.tagihan?.response_pg?.biller_code,
                                  'Bill Code',
                                )
                              }
                            >
                              {pesanan.tagihan?.response_pg?.biller_code}
                              &nbsp;
                              <CopyOutlined />
                            </button>
                          </Row>
                        </>
                      )}
                      <Row>
                        <span>Deskripsi</span>
                        <span className="max-w-[60%]">{pesanan.tagihan.deskripsi}</span>
                      </Row>
                    </>
                  )}

                  <Row>
                    <span>Total Harga Produk</span>
                    <span>
                      {formatCurrency(pesanan.informasi_harga.harga_total_produk)}
                    </span>
                  </Row>
                  {pesanan.informasi_harga.harga_kode_unik && (
                    <Row>
                      <span>Kode Unik</span>
                      <span>
                        {formatCurrency(pesanan.informasi_harga.harga_kode_unik)}
                      </span>
                    </Row>
                  )}
                </div>
                <hr className="border-dashed border-color-theme mt-4 mb-4" />
                <Row>
                  <span className="font-bold text-lg text-color-theme">Total Bayar</span>
                  <b className="text-lg">
                    {formatCurrency(pesanan.informasi_harga.harga_total_bayar)}
                  </b>
                </Row>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-4 space-y-2">
              {pesanan.status === 'VERIFIKASI_PERSYARATAN' && (
                <Button
                  disabled={!pesanan.persyaratan}
                  onClick={() => setShowModalKonfirmasi(true)}
                  block
                  size="large"
                  type={`primary`}
                >
                  Konfirmasi Verifikasi
                </Button>
              )}
              {pesanan.status === 'DIKEMAS' && (
                <Button
                  onClick={() => setShowModalAturPengiriman(true)}
                  block
                  size="large"
                  type={`primary`}
                >
                  Konfirmasi Pengiriman
                </Button>
              )}
            </div>
          </section>
        </>
      )}
    </section>
  );
}
