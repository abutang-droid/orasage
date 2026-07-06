import type { CollectionConfig } from 'payload';
import { requiredText } from '../lib/validators';

/** 国家 ↔ 主流信仰 — 运营可增删改 prevalence */
export const CountryFaiths: CollectionConfig = {
  slug: 'country-faiths',
  labels: {
    singular: '国家主流信仰',
    plural: '国家主流信仰',
  },
  access: {
    read: () => true,
  },
  admin: {
    group: '祈福地理',
    useAsTitle: 'label',
    defaultColumns: ['country', 'faith', 'prevalence', 'isPrimary', 'wpStatus'],
    description: '某国家/地区的主流信仰及占比权重。prevalence 越高在选信仰时越靠前。',
  },
  fields: [
    {
      name: 'label',
      label: '管理标签',
      type: 'text',
      admin: {
        hidden: true,
        readOnly: true,
        description: '由国家+信仰自动生成，便于后台搜索',
      },
    },
    {
      name: 'country',
      label: '国家/地区',
      type: 'relationship',
      relationTo: 'geo-countries',
      required: true,
      index: true,
    },
    {
      name: 'faith',
      label: '宗教',
      type: 'relationship',
      relationTo: 'faiths',
      required: true,
      index: true,
    },
    {
      name: 'prevalence',
      label: '主流程度',
      type: 'number',
      required: true,
      min: 1,
      max: 100,
      defaultValue: 50,
      admin: {
        description: '1–100，越高越靠前展示；可理解为该国信众占比权重',
      },
    },
    {
      name: 'isPrimary',
      label: '该国最主流',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: '勾选后在 UI 显示「主流」标签',
      },
    },
    {
      name: 'note',
      label: '运营备注',
      type: 'textarea',
      admin: { description: '内部备注，不对用户展示' },
    },
    {
      name: 'wpStatus',
      label: '发布状态',
      type: 'select',
      defaultValue: 'publish',
      options: [
        { label: '已发布', value: 'publish' },
        { label: '草稿', value: 'draft' },
      ],
      admin: { position: 'sidebar' },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (!data?.country || !data?.faith) return data;
        const countryId = typeof data.country === 'object' ? data.country.id : data.country;
        const faithId = typeof data.faith === 'object' ? data.faith.id : data.faith;
        const country = await req.payload.findByID({
          collection: 'geo-countries',
          id: countryId,
          depth: 0,
        });
        const faith = await req.payload.findByID({
          collection: 'faiths',
          id: faithId,
          depth: 0,
        });
        return {
          ...data,
          label: `${country.nameZh} · ${faith.nameZh}`,
        };
      },
    ],
  },
};
