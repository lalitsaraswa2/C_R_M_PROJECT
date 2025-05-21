
import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import axios from 'axios';
import fatch from '../../lib/Fatch';
import {
  Skeleton, Table, Button, Modal, Divider, Form, Input, Pagination
} from 'antd';
import {
  DeleteOutlined, EditOutlined,
  PlusOutlined, SearchOutlined, UploadOutlined, UserAddOutlined, DownloadOutlined
} from '@ant-design/icons';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/material.css';
import moment from 'moment';
import { toast } from 'react-toastify';
import * as XLS from 'xlsx';

axios.defaults.baseURL = "http://localhost:8070";

function Customer() {
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchKey, setSearchKey] = useState('');
  const [importModal, setImportModal] = useState(false);
  const [importedCustomers, setImportedCustomers] = useState([]);
  const [formAdd] = Form.useForm();
  const [formEdit] = Form.useForm();

  const { data, error, isLoading } = useSWR(`/coustmer?page=${page}&limit=${limit}`, fatch)
  // console.log("Raw fetched data:", data);

  // Delete customer
  const deleteCustomer = async (id) => {
    try {
      await axios.delete(`/coustmer/${id}`);
      toast.success("Customer deleted successfully", { position: 'top-center' });
      mutate(`/coustmer?page=${page}&limit=${limit}`);
    } catch (err) {
      toast.error("Failed to delete", { position: 'top-center' });
    }
  };

  // Add customer
  const addCustomer = async (values) => {
    const existing = data?.customers || [];

    if (existing.some(c => c.fullname.toLowerCase() === values.fullname.toLowerCase())) {
      toast.error("This name already exists", { position: 'top-center' });
      return;
    }

    if (existing.some(c => c.email.toLowerCase() === values.email.toLowerCase())) {
      toast.error("This email already exists", { position: 'top-center' });
      return;
    }

    const cleanedMobile = values.mobile.replace(/\D/g, '').slice(-10);
    if (!/^\d{10}$/.test(cleanedMobile)) {
      toast.error("Mobile must be exactly 10 digits", { position: 'top-center' });
      return;
    }

    try {
      await axios.post('/coustmer', { ...values, mobile: cleanedMobile });
      toast.success("Customer Created Successfully", { position: 'top-center' });
      setOpenAdd(false);
      formAdd.resetFields();
      mutate(`/coustmer?page=${page}&limit=${limit}`);
    } catch (error) {
      toast.error(error.message, { position: 'top-center' });
    }
  };

  // Update customer
  const updateCustomer = async (values) => {
    const existing = data?.customers || [];
    if (!editingCustomer) return;

    const others = existing.filter(c => c._id !== editingCustomer._id);

    if (others.some(c => c.fullname.toLowerCase() === values.fullname.toLowerCase())) {
      toast.error("This name already exists", { position: 'top-center' });
      return;
    }

    if (others.some(c => c.email.toLowerCase() === values.email.toLowerCase())) {
      toast.error("This email already exists", { position: 'top-center' });
      return;
    }

    const cleanedMobile = values.mobile.replace(/\D/g, '').slice(-10);
    if (!/^\d{10}$/.test(cleanedMobile)) {
      toast.error("Mobile must be exactly 10 digits", { position: 'top-center' });
      return;
    }

    try {
      await axios.put(`/coustmer/${editingCustomer._id}`, { ...values, mobile: cleanedMobile });
      toast.success("Customer Updated Successfully", { position: 'top-center' });
      setOpenEdit(false);
      setEditingCustomer(null);
      formEdit.resetFields();
      mutate(`/coustmer?page=${page}&limit=${limit}`);
    } catch (error) {
      toast.error(error.message, { position: 'top-center' });
    }
  };

  const onPaginate = (pageNo, pageSize) => {
    setPage(pageNo);
    setLimit(pageSize);
  };

  const handleSearchInput = (e) => {
    setSearchKey(e.target.value.toLowerCase());
  };

  const filteredCustomers = data?.customers?.filter((item) =>
    [item.fullname, item.email, item.mobile].some(field =>
      field?.toLowerCase().includes(searchKey)
    )
  ) || [];

  const downloadSample = () => {
    const a = document.createElement("a");
    a.href = process.env.PUBLIC_URL + "/SampleXLStype_19kb.xls";
    a.download = "SampleXLStype_19kb.xls";
    a.click();
    a.remove();
  };

  const exportToExcel = () => {
    const exportData = [...filteredCustomers];
    if (exportData.length === 0) {
      return toast.warn("No data to export", { position: "top-center" });
    }

    const worksheet = XLS.utils.json_to_sheet(exportData);
    const workbook = XLS.utils.book_new();
    XLS.utils.book_append_sheet(workbook, worksheet, "Customers");

    XLS.writeFile(workbook, "Customers_Export.xlsx");
  };

  const importXlstype = async (e) => {
    const file = e.target.files[0];

    if (!file || (!file.name.endsWith('.xls') && !file.name.endsWith('.xlsx'))) {
      return toast.error("Invalid file type. Please upload .xls or .xlsx", { position: "top-center" });
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const result = new Uint8Array(event.target.result);
        const workbook = XLS.read(result, { type: "array" });
        const firstSheet = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheet];
        const rawData = XLS.utils.sheet_to_json(sheet, { defval: "" });

        if (rawData.length === 0) {
          return toast.error("Your file is empty", { position: "top-center" });
        }

        const normalizeKey = (key) => key.trim().toLowerCase().replace(/\s+/g, '');

        const customers = rawData.map((item, index) => {
          const normalized = {};
          for (let key in item) {
            normalized[normalizeKey(key)] = item[key];
          }

          return {
            _id: `imported-${index}`,
            fullname: normalized.fullname || '',
            email: normalized.email || '',
            mobile: normalized.mobile || '',
            createdAt: new Date().toISOString()
          };
        });

        setImportedCustomers(customers);
        toast.success(`${customers.length} customers imported successfully`, { position: "top-center" });
        setImportModal(false);
      } catch (err) {
        console.error("Excel Parse Error:", err);
        toast.error("Failed to import. Check format.", { position: "top-center" });
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const columns = [
    {
      key: 'fullname',
      title: 'Fullname',
      dataIndex: 'fullname',
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
    },
    {
      key: 'mobile',
      title: 'Mobile',
      dataIndex: 'mobile',
    },
    {
      key: 'created',
      title: 'Created',
      render: (item) => (
        <label>{moment(item.createdAt).format('DD MMM yyyy, hh:mm A')}</label>
      ),
    },
    {
      key: 'action',
      title: 'Action',
      render: (item) => (
        <div className='space-x-3'>
          <Button
            icon={<EditOutlined />}
            className='!text-violet-600 !border-violet-600 !border-2'
            onClick={() => {
              setEditingCustomer(item);
              formEdit.setFieldsValue({
                fullname: item.fullname,
                email: item.email,
                mobile: item.mobile
              });
              setOpenEdit(true);
            }}
          />
          <Button
            onClick={() => deleteCustomer(item._id)}
            icon={<DeleteOutlined />}
            className='!text-rose-600 !border-rose-600 !border-2'
          />
        </div>
      ),
    }
  ];

  if (isLoading) return <Skeleton active />;

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <Input
          size='large'
          placeholder='Search customers'
          prefix={<SearchOutlined className='!text-gray-300' />}
          className='!w-[350px]'
          value={searchKey}
          onChange={handleSearchInput}
        />
        <div className='space-x-3'>
          <Button icon={<UploadOutlined />} size='large' onClick={() => setImportModal(true)}>
            Import Customers
          </Button>
          <Button icon={<DownloadOutlined />} size='large' onClick={exportToExcel}>
            Export Customers
          </Button>
          <Button
            icon={<PlusOutlined />}
            size='large'
            type='primary'
            className='!bg-violet-500'
            onClick={() => setOpenAdd(true)}
          >
            Add Customer
          </Button>
        </div>
      </div>
      <Divider />
      <Table
        columns={columns}
        dataSource={[...filteredCustomers, ...importedCustomers]}
        rowKey="_id"
        pagination={false}
      />
      <div className='flex justify-end'>
        <Pagination
          total={data?.total || 0}
          onChange={onPaginate}
          current={page}
          pageSize={limit}
          hideOnSinglePage
        />
      </div>

      {/* Import Modal */}
      <Modal open={importModal} footer={null} onCancel={() => setImportModal(false)} maskClosable={false}>
        <input type="file" accept=".xls, .xlsx" onChange={importXlstype} />
      </Modal>

      {/* Add Customer Modal */}
      <Modal open={openAdd} footer={null} onCancel={() => { setOpenAdd(false); formAdd.resetFields(); }} maskClosable={false}>
        <Divider />
        <Form layout='vertical' onFinish={addCustomer} form={formAdd}>
          <Form.Item label="Customer's name" name="fullname" rules={[{ required: true }]}>
            <Input size='large' placeholder='Mr Pahlad' />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
            <Input size='large' placeholder='mail@mail.com' />
          </Form.Item>
          <Form.Item label="Mobile" name="mobile" rules={[{ required: true }]}>
            <PhoneInput country={'in'} containerClass='!w-full' inputClass='!w-full' />
          </Form.Item>
          <Form.Item>
            <Button icon={<UserAddOutlined />} type='primary' htmlType='submit' size='large'>
              Add Now
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal open={openEdit} footer={null} onCancel={() => { setOpenEdit(false); setEditingCustomer(null); formEdit.resetFields(); }} maskClosable={false}>
        <Divider />
        <Form layout='vertical' onFinish={updateCustomer} form={formEdit}>
          <Form.Item label="Customer's name" name="fullname" rules={[{ required: true }]}>
            <Input size='large' placeholder='Mr Pahlad' />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }]}>
            <Input size='large' placeholder='mail@mail.com' />
          </Form.Item>
          <Form.Item label="Mobile" name="mobile" rules={[{ required: true }]}>
            <PhoneInput country={'in'} containerClass='!w-full' inputClass='!w-full' />
          </Form.Item>
          <Form.Item>
            <Button icon={<UserAddOutlined />} type='primary' htmlType='submit' size='large'>
              Update Now
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Customer;
