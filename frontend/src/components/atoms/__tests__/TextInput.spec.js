import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import TextInput from '../TextInput.vue'

describe('TextInput', () => {
  it('renders correctly', () => {
    const wrapper = mount(TextInput, {
      props: {
        label: 'Test Label',
        modelValue: 'test value'
      }
    })
    expect(wrapper.find('input').element.value).toBe('test value')
    expect(wrapper.text()).toContain('Test Label')
  })

  it('associates label with input using id and for', () => {
    const wrapper = mount(TextInput, {
      props: {
        label: 'Test Label',
        id: 'test-id'
      }
    })

    const label = wrapper.find('label')
    const input = wrapper.find('input')

    expect(label.attributes('for')).toBe('test-id')
    expect(input.attributes('id')).toBe('test-id')
  })

  it('generates an id if none is provided', () => {
    const wrapper = mount(TextInput, {
      props: {
        label: 'Test Label'
      }
    })

    const label = wrapper.find('label')
    const input = wrapper.find('input')

    const id = input.attributes('id')
    expect(id).toBeDefined()
    expect(label.attributes('for')).toBe(id)
  })
})
